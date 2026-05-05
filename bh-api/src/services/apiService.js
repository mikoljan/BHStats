import Goal from "../models/goalModel.js";
import Match from "../models/matchModel.js";
import Penalty from "../models/penaltyModel.js";
import Player from "../models/playerModel.js";
import Season from "../models/seasonModel.js";
import Stadium from "../models/stadiumModel.js";
import Team from "../models/teamModel.js";

const MATCH_POPULATE = [
  { path: "season" },
  { path: "stadium" },
  { path: "opponent" },
  { path: "presentPlayers" },
  { path: "goaliesMinutes.player" },
];

// Normalizes ids from ObjectIds, populated documents, or strings.
function stringifyId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value._id) {
    return String(value._id);
  }

  return String(value);
}

// Converts a stored date to the API YYYY-MM-DD format.
function toDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

// Maps stored verbose results to the short API enum.
function toMatchResult(result) {
  if (result === "Win" || result === "Penalty Win") {
    return "W";
  }

  if (result === "Loss" || result === "Penalty Loss") {
    return "L";
  }

  return "D";
}

// Normalizes imported goal type variants to one API label.
function normalizeGoalType(type) {
  if (!type) {
    return "even strength";
  }

  const normalized = String(type).trim().toLowerCase();
  const typeMap = {
    ev: "even strength",
    even: "even strength",
    "even strength": "even strength",
    pp: "power play",
    "power play": "power play",
    sh: "shorthanded",
    shg: "shorthanded",
    shorthanded: "shorthanded",
    ps: "penalty shot",
    "penalty shot": "penalty shot",
    en: "empty net",
    "empty net": "empty net",
  };

  return typeMap[normalized] || String(type);
}

// Derives a display position for player payloads.
function normalizePosition(player, playerContexts) {
  if (player.position) {
    return player.position;
  }

  const context = playerContexts.get(stringifyId(player._id));
  if (context?.goalieMatches > 0 && context?.skaterMatches === 0) {
    return "goalie";
  }

  return "utility";
}

// Builds the embedded player summary object used in stats endpoints.
function getPlayerSummary(player, playerContexts) {
  return {
    id: stringifyId(player._id),
    name: player.name,
    number: player.number,
    position: normalizePosition(player, playerContexts),
  };
}

// Collects squad and appearance context per player from all matches.
function buildPlayerContexts(players, matches) {
  const contexts = new Map();

  for (const player of players) {
    contexts.set(stringifyId(player._id), {
      goalieMatches: 0,
      skaterMatches: 0,
      squads: new Set(),
    });
  }

  for (const match of matches) {
    const squad = match.season?.team || null;

    for (const player of match.presentPlayers || []) {
      const playerId = stringifyId(player._id || player);
      const context = contexts.get(playerId);
      if (!context) {
        continue;
      }

      context.skaterMatches += 1;
      if (squad) {
        context.squads.add(squad);
      }
    }

    for (const goalieEntry of match.goaliesMinutes || []) {
      const playerId = stringifyId(goalieEntry.player?._id || goalieEntry.player);
      const context = contexts.get(playerId);
      if (!context) {
        continue;
      }

      context.goalieMatches += 1;
      if (squad) {
        context.squads.add(squad);
      }
    }
  }

  return contexts;
}

// Serializes one player to the public API shape.
function serializePlayer(player, playerContexts) {
  const context = playerContexts.get(stringifyId(player._id));
  return {
    ...getPlayerSummary(player, playerContexts),
    squads: [...(context?.squads || [])].sort(),
  };
}

// Serializes one goal to the public API shape.
function serializeGoal(goal) {
  return {
    id: stringifyId(goal._id),
    type: normalizeGoalType(goal.type),
    time: goal.time || 0,
    scorerId: stringifyId(goal.scorer),
    assistId: stringifyId(goal.assist),
    goalieId: stringifyId(goal.goalie),
    matchId: stringifyId(goal.match),
    ourTeam: Boolean(goal.ourTeam),
    winningGoal: Boolean(goal.winningGoal),
    equalizingGoal: Boolean(goal.equalizingGoal),
  };
}

// Serializes one penalty to the public API shape.
function serializePenalty(penalty) {
  return {
    id: stringifyId(penalty._id),
    type: penalty.type,
    time: penalty.time || 0,
    penaltyMinutes: penalty.penaltyMinutes || 0,
    playerId: stringifyId(penalty.player),
    matchId: stringifyId(penalty.match),
    ourTeam: Boolean(penalty.ourTeam),
  };
}

// Serializes one match together with nested event data.
function serializeMatch(match, goalsByMatchId, penaltiesByMatchId) {
  const matchId = stringifyId(match._id);
  return {
    id: matchId,
    squad: match.season?.team || null,
    stadiumId: stringifyId(match.stadium),
    date: toDateOnly(match.date),
    opponent: match.opponent?.name || null,
    seasonId: stringifyId(match.season),
    homeGame: Boolean(match.homeGame),
    matchLength: match.matchLength || 0,
    ourScore: match.ourScore || 0,
    opponentScore: match.opponentScore || 0,
    result: toMatchResult(match.result),
    presentPlayerIds: (match.presentPlayers || []).map((player) => stringifyId(player)).filter(Boolean),
    goalieMinutes: (match.goaliesMinutes || []).map((entry) => ({
      playerId: stringifyId(entry.player),
      minutesPlayed: entry.minutesPlayed || 0,
    })),
    goals: goalsByMatchId.get(matchId) || [],
    penalties: penaltiesByMatchId.get(matchId) || [],
  };
}

// Creates the accumulator used for skater stat aggregation.
function createStatAccumulator(player) {
  return {
    player,
    matches: new Set(),
    goals: 0,
    assists: 0,
    penaltyMinutes: 0,
    goalieMinutes: 0,
    powerPlayGoals: 0,
    shorthandedGoals: 0,
    gameWinningGoals: 0,
    gameTyingGoals: 0,
    penaltyShotGoals: 0,
    emptyNetGoals: 0,
  };
}

// Creates the accumulator used for goalie stat aggregation.
function createGoalieAccumulator(player) {
  return {
    player,
    matches: new Set(),
    wins: 0,
    cleanSheets: 0,
    minutes: 0,
    goalsAgainst: 0,
    assists: 0,
    shootouts: 0,
    shootoutGoalsAgainst: 0,
  };
}

// Rounds numbers to two decimals for API responses.
function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Keeps only goalie-minute entries that represent actual time in goal.
function sanitizeGoalieMinutes(entries) {
  return (entries || [])
    .map((entry) => ({
      player: entry?.player ?? null,
      minutesPlayed: Number(entry?.minutesPlayed || 0),
    }))
    .filter((entry) => entry.player && entry.minutesPlayed > 0);
}

  // Aggregates skater statistics from matches, goals, and penalties.
function computePlayerStats(players, matches, goals, penalties, playerContexts) {
  const stats = new Map(players.map((player) => [stringifyId(player._id), createStatAccumulator(player)]));
  const matchIndex = new Map(matches.map((match) => [stringifyId(match._id), match]));

  for (const match of matches) {
    for (const player of match.presentPlayers || []) {
      const stat = stats.get(stringifyId(player._id || player));
      if (stat) {
        stat.matches.add(stringifyId(match._id));
      }
    }

    for (const goalieEntry of match.goaliesMinutes || []) {
      const stat = stats.get(stringifyId(goalieEntry.player?._id || goalieEntry.player));
      if (stat) {
        stat.goalieMinutes += goalieEntry.minutesPlayed || 0;
      }
    }
  }

  for (const goal of goals) {
    const normalizedType = normalizeGoalType(goal.type);
    const scorerId = stringifyId(goal.scorer);
    const assistId = stringifyId(goal.assist);
    const matchId = stringifyId(goal.match);

    if (goal.ourTeam && scorerId && stats.has(scorerId)) {
      const scorerStats = stats.get(scorerId);
      scorerStats.goals += 1;
      scorerStats.matches.add(matchId);
      if (normalizedType === "power play") {
        scorerStats.powerPlayGoals += 1;
      }
      if (normalizedType === "shorthanded") {
        scorerStats.shorthandedGoals += 1;
      }
      if (normalizedType === "penalty shot") {
        scorerStats.penaltyShotGoals += 1;
      }
      if (normalizedType === "empty net") {
        scorerStats.emptyNetGoals += 1;
      }
      if (goal.winningGoal) {
        scorerStats.gameWinningGoals += 1;
      }
      if (goal.equalizingGoal) {
        scorerStats.gameTyingGoals += 1;
      }
    }

    if (goal.ourTeam && assistId && stats.has(assistId)) {
      const assistStats = stats.get(assistId);
      assistStats.assists += 1;
      assistStats.matches.add(matchId);
    }
  }

  for (const penalty of penalties) {
    if (!penalty.ourTeam) {
      continue;
    }

    const playerId = stringifyId(penalty.player);
    const stat = stats.get(playerId);
    if (!stat) {
      continue;
    }

    stat.penaltyMinutes += penalty.penaltyMinutes || 0;
    stat.matches.add(stringifyId(penalty.match));
  }

  return [...stats.values()].map((stat) => {
    const matchesCount = stat.matches.size;
    const points = stat.goals + stat.assists;
    return {
      player: getPlayerSummary(stat.player, playerContexts),
      matches: matchesCount,
      goals: stat.goals,
      assists: stat.assists,
      points,
      penaltyMinutes: stat.penaltyMinutes,
      goalieMinutes: round(stat.goalieMinutes),
      pointsPerGame: matchesCount ? round(points / matchesCount) : 0,
      powerPlayGoals: stat.powerPlayGoals,
      shorthandedGoals: stat.shorthandedGoals,
      gameWinningGoals: stat.gameWinningGoals,
      gameTyingGoals: stat.gameTyingGoals,
      penaltyShotGoals: stat.penaltyShotGoals,
      emptyNetGoals: stat.emptyNetGoals,
      _playerId: stringifyId(stat.player._id),
      _playerName: stat.player.name,
      _position: normalizePosition(stat.player, playerContexts),
    };
  }).sort((left, right) => right.points - left.points || right.goals - left.goals || left.player.name.localeCompare(right.player.name));
}

// Aggregates goalie statistics from real goalie appearances and conceded goals.
function computeGoalieStats(players, matches, goals, playerContexts) {
  const stats = new Map(players.map((player) => [stringifyId(player._id), createGoalieAccumulator(player)]));
  const goalsByMatch = new Map();

  for (const goal of goals) {
    const matchId = stringifyId(goal.match);
    const entries = goalsByMatch.get(matchId) || [];
    entries.push(goal);
    goalsByMatch.set(matchId, entries);
  }

  for (const match of matches) {
    const matchGoals = goalsByMatch.get(stringifyId(match._id)) || [];
    const activeGoalies = sanitizeGoalieMinutes(match.goaliesMinutes || []);
    if (!activeGoalies.length) {
      continue;
    }

    const goalsAgainst = matchGoals.filter(
      (goal) => !goal.ourTeam && normalizeGoalType(goal.type) !== "empty net"
    );
    const totalGoalieMinutes = activeGoalies.reduce((sum, goalieEntry) => sum + goalieEntry.minutesPlayed, 0);
    const won = toMatchResult(match.result) === "W";

    for (const goalieEntry of activeGoalies) {
      const playerId = stringifyId(goalieEntry.player?._id || goalieEntry.player);
      const stat = stats.get(playerId);
      if (!stat) {
        continue;
      }

      stat.matches.add(stringifyId(match._id));
      stat.minutes += goalieEntry.minutesPlayed;
      const explicitlyAssignedGoalsAgainst = goalsAgainst.filter((goal) => stringifyId(goal.goalie) === playerId).length;
      const unassignedGoalsAgainst = goalsAgainst.filter((goal) => !stringifyId(goal.goalie)).length;

      stat.goalsAgainst += explicitlyAssignedGoalsAgainst;
      stat.goalsAgainst += totalGoalieMinutes > 0 ? unassignedGoalsAgainst * (goalieEntry.minutesPlayed / totalGoalieMinutes) : 0;
      if (won) {
        stat.wins += 1;
      }
      if (goalsAgainst.length === 0) {
        stat.cleanSheets += 1;
      }
    }
  }

  for (const goal of goals) {
    const assistId = stringifyId(goal.assist);
    const stat = stats.get(assistId);
    if (stat) {
      stat.assists += 1;
    }
  }

  return [...stats.values()]
    .filter((stat) => stat.matches.size > 0 || stat.minutes > 0)
    .map((stat) => ({
      player: getPlayerSummary(stat.player, playerContexts),
      matches: stat.matches.size,
      wins: stat.wins,
      cleanSheets: stat.cleanSheets,
      minutes: round(stat.minutes),
      goalsAgainst: round(stat.goalsAgainst),
      goalsAgainstPerGame: stat.matches.size ? round(stat.goalsAgainst / stat.matches.size) : 0,
      assists: stat.assists,
      shootouts: stat.shootouts,
      shootoutGoalsAgainst: stat.shootoutGoalsAgainst,
      shootoutSavePercentage: null,
      _playerId: stringifyId(stat.player._id),
      _playerName: stat.player.name,
    }))
    .sort((left, right) => right.wins - left.wins || left.goalsAgainstPerGame - right.goalsAgainstPerGame || left.player.name.localeCompare(right.player.name));
}

// Serializes one season to the public API shape.
export function serializeSeason(season) {
  return {
    id: stringifyId(season._id),
    year: season.year,
    team: season.team,
    matchLength: season.matchLength ?? 36,
    leagueLevel: season.leagueLevel,
    leagueName: season.leagueName || "",
    position: season.position ?? null,
    movement: season.movement ?? null,
    covidInterrupted: Boolean(season.covidInterrupted),
  };
}

// Builds season history rows enriched with summary numbers.
function buildSeasonHistory(seasons, matches) {
  const rows = [];

  for (const season of seasons) {
    const seasonMatches = matches.filter((match) => stringifyId(match.season) === stringifyId(season._id));
    const aggregate = buildTeamRecordSummary(seasonMatches);
    rows.push({
      season: serializeSeason(season),
      matches: aggregate.matches,
      wins: aggregate.wins,
      draws: aggregate.draws,
      losses: aggregate.losses,
      goalsFor: aggregate.goalsFor,
      goalsAgainst: aggregate.goalsAgainst,
      points: aggregate.points,
    });
  }

  return rows.sort((left, right) => right.season.year.localeCompare(left.season.year));
}

// Computes the basic win-draw-loss summary for a match set.
function buildTeamRecordSummary(matches) {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of matches) {
    const result = toMatchResult(match.result);
    if (result === "W") {
      wins += 1;
    } else if (result === "D") {
      draws += 1;
    } else {
      losses += 1;
    }

    goalsFor += match.ourScore || 0;
    goalsAgainst += match.opponentScore || 0;
  }

  return {
    matches: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points: wins * 3 + draws,
  };
}

// Counts special-team opportunities from penalty events, including stacked penalties.
function buildSpecialTeamsSummary(penalties) {
  const situationsByMatchTime = new Map();

  for (const penalty of penalties) {
    const matchId = stringifyId(penalty.match);
    const key = `${matchId}:${penalty.time || 0}`;
    const situation = situationsByMatchTime.get(key) || {
      ourPenalties: 0,
      opponentPenalties: 0,
    };

    if (penalty.ourTeam) {
      situation.ourPenalties += 1;
    } else {
      situation.opponentPenalties += 1;
    }

    situationsByMatchTime.set(key, situation);
  }

  let powerPlayOpportunities = 0;
  let penaltyKillOpportunities = 0;

  for (const situation of situationsByMatchTime.values()) {
    powerPlayOpportunities += Math.max(0, situation.opponentPenalties - situation.ourPenalties);
    penaltyKillOpportunities += Math.max(0, situation.ourPenalties - situation.opponentPenalties);
  }

  return {
    powerPlayOpportunities,
    penaltyKillOpportunities,
  };
}

// Counts goals against by normalized goal type for overview special-team metrics.
function countGoalsAgainstByType(goals, normalizedTypes) {
  const allowedTypes = new Set(normalizedTypes);
  return goals.filter(
    (goal) => !goal.ourTeam && allowedTypes.has(normalizeGoalType(goal.type))
  ).length;
}

// Builds the overview aggregate block for dashboard endpoints.
function buildOverviewAggregate(matches, goals, penalties) {
  const teamSummary = buildTeamRecordSummary(matches);
  const specialTeamsSummary = buildSpecialTeamsSummary(penalties);
  const powerPlayGoals = goals.filter((goal) => goal.ourTeam && normalizeGoalType(goal.type) === "power play").length;
  const powerPlayGoalsAgainst = countGoalsAgainstByType(goals, ["shorthanded"]);
  const penaltyKillGoalsAgainst = countGoalsAgainstByType(goals, [
    "power play",
    "shorthanded",
    "penalty shot",
    "OG",
  ]);
  const shorthandedGoals = goals.filter((goal) => goal.ourTeam && normalizeGoalType(goal.type) === "shorthanded").length;

  return {
    matches: teamSummary.matches,
    wins: teamSummary.wins,
    overtimeWins: 0,
    draws: teamSummary.draws,
    overtimeLosses: 0,
    losses: teamSummary.losses,
    points: teamSummary.points,
    goalsFor: teamSummary.goalsFor,
    goalsAgainst: teamSummary.goalsAgainst,
    goalDiff: teamSummary.goalsFor - teamSummary.goalsAgainst,
    powerPlayOpportunities: specialTeamsSummary.powerPlayOpportunities,
    powerPlayGoals,
    powerPlayEfficiency: specialTeamsSummary.powerPlayOpportunities ? round((powerPlayGoals / specialTeamsSummary.powerPlayOpportunities) * 100) : 0,
    powerPlayGoalsAgainst,
    penaltyKillOpportunities: specialTeamsSummary.penaltyKillOpportunities,
    penaltyKillGoalsAgainst,
    penaltyKillEfficiency: specialTeamsSummary.penaltyKillOpportunities ? round(((specialTeamsSummary.penaltyKillOpportunities - penaltyKillGoalsAgainst) / specialTeamsSummary.penaltyKillOpportunities) * 100) : 0,
    shorthandedGoals,
  };
}

// Builds scoring milestone rows from the historical goal order.
function buildMilestones(matches, goals, playersById) {
  const orderedMatches = [...matches].sort((left, right) => new Date(left.date || 0) - new Date(right.date || 0));
  const matchMap = new Map(orderedMatches.map((match) => [stringifyId(match._id), match]));
  const orderedGoals = [...goals]
    .filter((goal) => goal.ourTeam)
    .sort((left, right) => {
      const leftMatch = matchMap.get(stringifyId(left.match));
      const rightMatch = matchMap.get(stringifyId(right.match));
      const leftDate = leftMatch?.date ? new Date(leftMatch.date).getTime() : 0;
      const rightDate = rightMatch?.date ? new Date(rightMatch.date).getTime() : 0;
      return leftDate - rightDate || left.time - right.time;
    });

  const milestones = [];
  let count = 0;
  for (const goal of orderedGoals) {
    count += 1;
    if (count % 50 !== 0) {
      continue;
    }

    const match = matchMap.get(stringifyId(goal.match));
    const scorer = playersById.get(stringifyId(goal.scorer));
    milestones.push({
      milestone: count,
      date: toDateOnly(match?.date),
      opponent: match?.opponent?.name || null,
      scorerName: scorer?.name || "Unknown",
    });
  }

  return milestones;
}

// Applies squad, season, player, and league filters to a match list.
function filterMatches(matches, filters) {
  return matches.filter((match) => {
    if (filters.squad && match.season?.team !== filters.squad) {
      return false;
    }

    if (filters.scope && filters.scope !== "ALL" && match.season?.team !== filters.scope) {
      return false;
    }

    if (filters.seasonId && filters.seasonId !== "ALL" && stringifyId(match.season) !== filters.seasonId) {
      return false;
    }

    if (filters.playerId) {
      const presentPlayerIds = new Set((match.presentPlayers || []).map((player) => stringifyId(player)));
      for (const goalieEntry of match.goaliesMinutes || []) {
        presentPlayerIds.add(stringifyId(goalieEntry.player));
      }
      if (!presentPlayerIds.has(filters.playerId)) {
        return false;
      }
    }

    if (filters.leagueName && match.season?.leagueName !== filters.leagueName) {
      return false;
    }

    return true;
  });
}

// Applies a case-insensitive player-name search to stat rows.
function filterPlayersByQuery(rows, query) {
  if (!query) {
    return rows;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return rows.filter((row) => row.player.name.toLowerCase().includes(normalizedQuery));
}

// Builds one record-book table definition for frontend rendering.
function createRecordTable(key, eyebrow, title, caption, iconName, columns, rows) {
  return {
    key,
    eyebrow,
    title,
    caption,
    accentClassName: `accent-${key}`,
    iconName,
    columns,
    rows,
  };
}

// Builds one record-book section definition for frontend rendering.
function createRecordSection(key, eyebrow, title, description, tables) {
  return {
    key,
    eyebrow,
    title,
    description,
    gridClassName: "record-grid",
    tables,
  };
}

// Loads and prepares the full dataset needed by read endpoints.
export async function loadApiDataset() {
  const [players, seasons, stadiums, teams, matches, goals, penalties] = await Promise.all([
    Player.find().sort({ name: 1 }),
    Season.find().sort({ year: -1, team: 1 }),
    Stadium.find().sort({ name: 1 }),
    Team.find().sort({ name: 1 }),
    Match.find().populate(MATCH_POPULATE).sort({ date: -1, createdAt: -1 }),
    Goal.find().sort({ time: 1 }),
    Penalty.find().sort({ time: 1 }),
  ]);

  const goalsByMatchId = new Map();
  for (const goal of goals) {
    const matchId = stringifyId(goal.match);
    const entries = goalsByMatchId.get(matchId) || [];
    entries.push(serializeGoal(goal));
    goalsByMatchId.set(matchId, entries);
  }

  const penaltiesByMatchId = new Map();
  for (const penalty of penalties) {
    const matchId = stringifyId(penalty.match);
    const entries = penaltiesByMatchId.get(matchId) || [];
    entries.push(serializePenalty(penalty));
    penaltiesByMatchId.set(matchId, entries);
  }

  const playersById = new Map(players.map((player) => [stringifyId(player._id), player]));
  const seasonsById = new Map(seasons.map((season) => [stringifyId(season._id), season]));
  const playerContexts = buildPlayerContexts(players, matches);

  return {
    players,
    seasons,
    seasonsById,
    stadiums,
    teams,
    matches,
    goals,
    penalties,
    goalsByMatchId,
    penaltiesByMatchId,
    playersById,
    playerContexts,
  };
}

// Returns the serialized player list with optional filters.
export function listPlayers(dataset, filters = {}) {
  const players = dataset.players
    .map((player) => serializePlayer(player, dataset.playerContexts))
    .filter((player) => {
      if (filters.squad && !player.squads.includes(filters.squad)) {
        return false;
      }

      if (filters.position && player.position !== filters.position) {
        return false;
      }

      return true;
    });

  return players;
}

// Returns one serialized player by id.
export function getPlayerDetail(dataset, playerId) {
  const player = dataset.playersById.get(playerId);
  if (!player) {
    return null;
  }

  return serializePlayer(player, dataset.playerContexts);
}

// Returns the serialized season list.
export function listSeasons(dataset) {
  return dataset.seasons.map(serializeSeason);
}

// Returns the serialized stadium list.
export function listStadiums(dataset) {
  return dataset.stadiums.map((stadium) => ({ id: stringifyId(stadium._id), name: stadium.name }));
}

// Returns the serialized team list.
export function listTeams(dataset) {
  return dataset.teams.map((team) => ({ id: stringifyId(team._id), name: team.name }));
}

// Returns the serialized match list with optional filters.
export function listMatches(dataset, filters = {}) {
  return filterMatches(dataset.matches, filters).map((match) => serializeMatch(match, dataset.goalsByMatchId, dataset.penaltiesByMatchId));
}

// Returns one serialized match by id.
export function getMatchDetail(dataset, matchId) {
  const match = dataset.matches.find((item) => stringifyId(item._id) === matchId);
  if (!match) {
    return null;
  }

  return serializeMatch(match, dataset.goalsByMatchId, dataset.penaltiesByMatchId);
}

// Returns the overview payload for the selected filters.
export function getOverview(dataset, filters = {}) {
  const scope = filters.scope || "ALL";
  const seasonId = filters.seasonId || "ALL";
  const matches = filterMatches(dataset.matches, filters);
  const matchIds = new Set(matches.map((match) => stringifyId(match._id)));
  const goals = dataset.goals.filter((goal) => matchIds.has(stringifyId(goal.match)));
  const penalties = dataset.penalties.filter((penalty) => matchIds.has(stringifyId(penalty.match)));
  const seasons = scope && scope !== "ALL"
    ? dataset.seasons.filter((season) => season.team === scope)
    : dataset.seasons;

  return {
    scope,
    seasonId,
    summary: buildOverviewAggregate(matches, goals, penalties),
    teamRecordSummary: buildTeamRecordSummary(matches),
    seasonHistory: buildSeasonHistory(seasons, matches),
    milestones: buildMilestones(matches, goals, dataset.playersById),
    topPlayers: getPlayerStatistics(dataset, filters).slice(0, 5),
  };
}

// Returns skater statistics for the selected filters.
export function getPlayerStatistics(dataset, filters = {}) {
  const matches = filterMatches(dataset.matches, filters);
  const matchIds = new Set(matches.map((match) => stringifyId(match._id)));
  const goals = dataset.goals.filter((goal) => matchIds.has(stringifyId(goal.match)));
  const penalties = dataset.penalties.filter((penalty) => matchIds.has(stringifyId(penalty.match)));
  return filterPlayersByQuery(computePlayerStats(dataset.players, matches, goals, penalties, dataset.playerContexts), filters.query)
    .filter((row) => !filters.position || row._position === filters.position)
    .map(({ _playerId, _playerName, _position, ...row }) => row);
}

// Returns goalie statistics for the selected filters.
export function getGoalieStatistics(dataset, filters = {}) {
  const matches = filterMatches(dataset.matches, filters);
  const matchIds = new Set(matches.map((match) => stringifyId(match._id)));
  const goals = dataset.goals.filter((goal) => matchIds.has(stringifyId(goal.match)));
  return filterPlayersByQuery(computeGoalieStats(dataset.players, matches, goals, dataset.playerContexts), filters.query)
    .map(({ _playerId, _playerName, ...row }) => row);
}

// Returns the full derived player detail payload.
export function getPlayerStatsDetail(dataset, playerId) {
  const player = dataset.playersById.get(playerId);
  if (!player) {
    return null;
  }

  const overallStats = getPlayerStatistics(dataset).find((row) => row.player.id === playerId) || {
    player: getPlayerSummary(player, dataset.playerContexts),
    matches: 0,
    goals: 0,
    assists: 0,
    points: 0,
    penaltyMinutes: 0,
    goalieMinutes: 0,
    pointsPerGame: 0,
    powerPlayGoals: 0,
    shorthandedGoals: 0,
    gameWinningGoals: 0,
    gameTyingGoals: 0,
    penaltyShotGoals: 0,
    emptyNetGoals: 0,
  };

  const playerMatches = filterMatches(dataset.matches, { playerId });
  const serializedMatches = listMatches(dataset, { playerId });
  const serializedMatchById = new Map(serializedMatches.map((match) => [match.id, match]));
  const seasonRows = [];
  const seasonMap = new Map();

  for (const season of dataset.seasons) {
    seasonMap.set(stringifyId(season._id), {
      season: serializeSeason(season),
      matches: 0,
      goals: 0,
      assists: 0,
      points: 0,
      penaltyMinutes: 0,
    });
  }

  for (const match of playerMatches) {
    const matchId = stringifyId(match._id);
    const seasonId = stringifyId(match.season);
    const row = seasonMap.get(seasonId);
    if (!row) {
      continue;
    }

    row.matches += 1;
    row.goals += dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.scorer) === playerId).length;
    row.assists += dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.assist) === playerId).length;
    row.penaltyMinutes += dataset.penalties
      .filter((penalty) => stringifyId(penalty.match) === matchId && penalty.ourTeam && stringifyId(penalty.player) === playerId)
      .reduce((sum, penalty) => sum + (penalty.penaltyMinutes || 0), 0);
    row.points = row.goals + row.assists;
  }

  for (const row of seasonMap.values()) {
    if (row.matches) {
      seasonRows.push(row);
    }
  }

  const matchLog = playerMatches
    .map((match) => {
      const matchId = stringifyId(match._id);
      const goals = dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.scorer) === playerId).length;
      const assists = dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.assist) === playerId).length;
      const penaltyMinutes = dataset.penalties
        .filter((penalty) => stringifyId(penalty.match) === matchId && penalty.ourTeam && stringifyId(penalty.player) === playerId)
        .reduce((sum, penalty) => sum + (penalty.penaltyMinutes || 0), 0);

      return {
        match: serializedMatchById.get(matchId),
        goals,
        assists,
        points: goals + assists,
        penaltyMinutes,
        scored: goals > 0,
      };
    })
    .sort((left, right) => (right.match?.date || "").localeCompare(left.match?.date || ""));

  return {
    player: serializePlayer(player, dataset.playerContexts),
    overallStats,
    seasonRows,
    matchLog,
  };
}

// Builds the player record-book response for one scope.
export function getPlayerRecordBook(dataset, scope = "ALL") {
  const filters = scope === "ALL" ? {} : { scope };
  const playerStats = getPlayerStatistics(dataset, filters);
  const topScorer = playerStats[0] || null;
  const mostGoals = [...playerStats].sort((left, right) => right.goals - left.goals || left.player.name.localeCompare(right.player.name))[0] || null;
  const mostAssists = [...playerStats].sort((left, right) => right.assists - left.assists || left.player.name.localeCompare(right.player.name))[0] || null;
  const matchesLeader = [...playerStats].sort((left, right) => right.matches - left.matches || left.player.name.localeCompare(right.player.name))[0] || null;

  return {
    scope,
    heroStats: [
      { label: "Nejvíc bodů", value: topScorer ? `${topScorer.points}` : "0", note: topScorer ? topScorer.player.name : "Bez dat" },
      { label: "Nejvíc gólů", value: mostGoals ? `${mostGoals.goals}` : "0", note: mostGoals ? mostGoals.player.name : "Bez dat" },
      { label: "Nejvíc asistencí", value: mostAssists ? `${mostAssists.assists}` : "0", note: mostAssists ? mostAssists.player.name : "Bez dat" },
      { label: "Nejvíc zápasů", value: matchesLeader ? `${matchesLeader.matches}` : "0", note: matchesLeader ? matchesLeader.player.name : "Bez dat" },
    ],
    sections: [
      createRecordSection(
        "career",
        "Kariéra",
        "Historické tabulky",
        "Souhrnné rekordy napříč dostupnými zápasy.",
        [
          createRecordTable(
            "points",
            "Produktivita",
            "Body",
            "Hráči seřazení podle kanadského bodování.",
            "sparkles",
            [
              { key: "playerName", header: "Hráč" },
              { key: "goals", header: "G" },
              { key: "assists", header: "A" },
              { key: "points", header: "B" },
              { key: "matches", header: "Z" },
            ],
            playerStats.slice(0, 20).map((row) => ({
              id: row.player.id,
              playerName: row.player.name,
              goals: row.goals,
              assists: row.assists,
              points: row.points,
              matches: row.matches,
            }))
          ),
          createRecordTable(
            "special-goals",
            "Speciální góly",
            "Klíčové zásahy",
            "Přesilovky, oslabení a rozhodující trefy.",
            "star",
            [
              { key: "playerName", header: "Hráč" },
              { key: "goals", header: "PP" },
              { key: "assists", header: "SH" },
              { key: "points", header: "VG" },
              { key: "count", header: "EG" },
            ],
            [...playerStats]
              .sort((left, right) => (right.powerPlayGoals + right.shorthandedGoals + right.gameWinningGoals + right.emptyNetGoals) - (left.powerPlayGoals + left.shorthandedGoals + left.gameWinningGoals + left.emptyNetGoals) || left.player.name.localeCompare(right.player.name))
              .slice(0, 20)
              .map((row) => ({
                id: `${row.player.id}-special`,
                playerName: row.player.name,
                goals: row.powerPlayGoals,
                assists: row.shorthandedGoals,
                points: row.gameWinningGoals,
                count: row.emptyNetGoals,
              }))
          ),
        ]
      ),
    ],
  };
}

// Formats a match score for record-book tables.
function formatScore(match) {
  return `${match.ourScore || 0}:${match.opponentScore || 0}`;
}

// Builds the team record-book response for one scope.
export function getTeamRecordBook(dataset, scope = "ALL") {
  const filters = scope === "ALL" ? {} : { scope };
  const matches = filterMatches(dataset.matches, filters);
  const highestWin = [...matches].sort((left, right) => (right.ourScore - right.opponentScore) - (left.ourScore - left.opponentScore))[0] || null;
  const highestLoss = [...matches].sort((left, right) => (right.opponentScore - right.ourScore) - (left.opponentScore - left.ourScore))[0] || null;
  const highestScoring = [...matches].sort((left, right) => (right.ourScore + right.opponentScore) - (left.ourScore + left.opponentScore))[0] || null;

  return {
    scope,
    heroStats: [
      { label: "Zápasy", value: `${matches.length}`, note: "Dostupná historie" },
      { label: "Bilance", value: `${buildTeamRecordSummary(matches).points}`, note: "Body celkem" },
      { label: "Nejvyšší výhra", value: highestWin ? formatScore(highestWin) : "0:0", note: highestWin ? highestWin.opponent?.name || "" : "Bez dat" },
      { label: "Nejvyšší porážka", value: highestLoss ? formatScore(highestLoss) : "0:0", note: highestLoss ? highestLoss.opponent?.name || "" : "Bez dat" },
    ],
    sections: [
      createRecordSection(
        "team-matches",
        "Tým",
        "Zápasové rekordy",
        "Extrémy v dostupné databázi zápasů.",
        [
          createRecordTable(
            "wins",
            "Výhry a prohry",
            "Největší rozdíly",
            "Výběr zápasů s největším skóre nebo rozdílem.",
            "medal",
            [
              { key: "score", header: "Skóre" },
              { key: "opponent", header: "Soupeř" },
              { key: "date", header: "Datum" },
              { key: "count", header: "Rozdíl" },
            ],
            [...matches]
              .sort((left, right) => Math.abs((right.ourScore || 0) - (right.opponentScore || 0)) - Math.abs((left.ourScore || 0) - (left.opponentScore || 0)))
              .slice(0, 20)
              .map((match) => ({
                id: stringifyId(match._id),
                score: formatScore(match),
                opponent: match.opponent?.name || "",
                date: toDateOnly(match.date),
                count: (match.ourScore || 0) - (match.opponentScore || 0),
              }))
          ),
          createRecordTable(
            "totals",
            "Ofenziva",
            "Nejvíc branek v zápase",
            "Nejdivočejší utkání podle celkového skóre.",
            "zap",
            [
              { key: "score", header: "Skóre" },
              { key: "opponent", header: "Soupeř" },
              { key: "date", header: "Datum" },
              { key: "count", header: "Góly" },
            ],
            [...matches]
              .sort((left, right) => (right.ourScore + right.opponentScore) - (left.ourScore + left.opponentScore))
              .slice(0, 20)
              .map((match) => ({
                id: `${stringifyId(match._id)}-totals`,
                score: formatScore(match),
                opponent: match.opponent?.name || "",
                date: toDateOnly(match.date),
                count: (match.ourScore || 0) + (match.opponentScore || 0),
              }))
          ),
        ]
      ),
    ],
  };
}

// Builds the series matrix used by the frontend series page.
export function getSeriesMatrix(dataset, scope, query) {
  const matches = filterMatches(dataset.matches, { scope }).sort((left, right) => new Date(left.date || 0) - new Date(right.date || 0));
  const playerStats = getPlayerStatistics(dataset, { scope });
  const rows = [];

  for (const row of playerStats) {
    const cells = [];
    let goals = 0;
    let absences = 0;

    for (const match of matches) {
      const matchId = stringifyId(match._id);
      const played = (match.presentPlayers || []).some((player) => stringifyId(player) === row.player.id)
        || (match.goaliesMinutes || []).some((entry) => stringifyId(entry.player) === row.player.id);
      const playerGoals = dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.scorer) === row.player.id).length;
      const playerAssists = dataset.goals.filter((goal) => stringifyId(goal.match) === matchId && goal.ourTeam && stringifyId(goal.assist) === row.player.id).length;

      if (!played) {
        cells.push("absent");
        absences += 1;
      } else if (playerGoals > 0) {
        cells.push("goal");
        goals += playerGoals;
      } else if (playerAssists > 0) {
        cells.push("point");
      } else {
        cells.push("played");
      }
    }

    rows.push({
      id: row.player.id,
      playerName: row.player.name,
      cells,
      goals,
      absences,
    });
  }

  const filteredRows = query
    ? rows.filter((row) => row.playerName.toLowerCase().includes(query.trim().toLowerCase()))
    : rows;

  const seasons = [];
  let lastSeason = null;
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const seasonLabel = match.season?.year || "Bez sezóny";
    if (!lastSeason || lastSeason.label !== seasonLabel) {
      lastSeason = { label: seasonLabel, startIndex: index, span: 1 };
      seasons.push(lastSeason);
    } else {
      lastSeason.span += 1;
    }
  }

  return {
    scope,
    seasons,
    columns: matches.map((match, index) => ({
      index,
      season: match.season?.year || "",
      date: toDateOnly(match.date),
    })),
    rows: filteredRows,
    totalMatches: matches.length,
    goalMarks: filteredRows.reduce((sum, row) => sum + row.cells.filter((cell) => cell === "goal").length, 0),
    pointMarks: filteredRows.reduce((sum, row) => sum + row.cells.filter((cell) => cell === "point").length, 0),
    absentMarks: filteredRows.reduce((sum, row) => sum + row.absences, 0),
    hasExplicitPointMarks: true,
  };
}

// Normalizes an incoming match payload into model-ready documents.
export async function buildMatchWritePayload(payload, existingMatch = null) {
  const season = payload.seasonId ? await Season.findById(payload.seasonId) : existingMatch?.season || null;
  if (!season) {
    return { error: { status: 400, body: { code: "VALIDATION_ERROR", message: "seasonId is required and must exist.", details: { field: "seasonId" } } } };
  }

  let opponent = null;
  if (payload.opponent) {
    opponent = await Team.findOneAndUpdate(
      { name: payload.opponent },
      { $set: { name: payload.opponent } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else if (existingMatch?.opponent) {
    opponent = existingMatch.opponent;
  }

  if (!opponent) {
    return { error: { status: 400, body: { code: "VALIDATION_ERROR", message: "opponent is required.", details: { field: "opponent" } } } };
  }

  let stadium = null;
  if (payload.stadiumId) {
    stadium = await Stadium.findById(payload.stadiumId);
  } else if (existingMatch?.stadium) {
    stadium = existingMatch.stadium;
  }

  const computedResult = payload.ourScore > payload.opponentScore ? "W" : payload.ourScore < payload.opponentScore ? "L" : "D";
  const result = payload.result || computedResult;
  const seasonId = season._id || season;
  const opponentId = opponent._id || opponent;
  const stadiumId = stadium?._id || stadium || null;
  const goalieMinutes = sanitizeGoalieMinutes(
    (payload.goalieMinutes || []).map((entry) => ({
      player: entry.playerId,
      minutesPlayed: entry.minutesPlayed,
    }))
  );

  return {
    match: {
      season: seasonId,
      opponent: opponentId,
      stadium: stadiumId,
      date: payload.date ? new Date(`${payload.date}T00:00:00.000Z`) : null,
      homeGame: payload.homeGame,
      matchLength: payload.matchLength ?? existingMatch?.matchLength ?? season.matchLength ?? 36,
      ourScore: payload.ourScore,
      opponentScore: payload.opponentScore,
      result: result === "W" ? "Win" : result === "L" ? "Loss" : "Draw",
      presentPlayers: payload.presentPlayerIds || [],
      goaliesMinutes,
    },
    goals: (payload.goals || []).map((goal) => ({
      _id: goal.id || undefined,
      type: goal.type,
      time: goal.time,
      scorer: goal.scorerId || null,
      assist: goal.assistId || null,
      goalie: goal.goalieId || null,
      ourTeam: goal.ourTeam,
      winningGoal: goal.winningGoal,
      equalizingGoal: goal.equalizingGoal,
    })),
    penalties: (payload.penalties || []).map((penalty) => ({
      _id: penalty.id || undefined,
      type: penalty.type,
      time: penalty.time,
      penaltyMinutes: penalty.penaltyMinutes,
      player: penalty.playerId || null,
      ourTeam: penalty.ourTeam,
    })),
  };
}