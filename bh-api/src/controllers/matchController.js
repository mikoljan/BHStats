import Match from "../models/matchModel.js";
import Goal from "../models/goalModel.js";
import Penalty from "../models/penaltyModel.js";
import Player from "../models/playerModel.js";
import Season from "../models/seasonModel.js";
import Team from "../models/teamModel.js";
import Stadium from "../models/stadiumModel.js";
import { loadHtml, getDivSection } from "../utils/helpers.js";
import { findTeamSeasonByYear } from "./seasonController.js";
import { buildMatchWritePayload, getMatchDetail, listMatches, loadApiDataset } from "../services/apiService.js";
import * as cheerio from "cheerio";

const OUR_TEAM_MARKER = "blue horses";

// Normalizes scraped text values by collapsing whitespace and nbsp characters.
function normalizeText(value) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

// Returns all tables that belong to a titled statistics section.
function getSectionTables(title, $) {
  const section = getDivSection(title, $);
  if (!section || !section.length) {
    return [];
  }

  return section.find("table").toArray();
}

// Parses a player cell into the stored number and display name.
function parsePlayerCell(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const withoutRole = normalized.replace(/\s*\([^)]*\)\s*$/, "");
  const match = withoutRole.match(/^(\d+)\s+(.+)$/);
  if (!match) {
    return {
      number: "0",
      name: withoutRole,
    };
  }

  return {
    number: match[1],
    name: match[2].trim(),
  };
}

// Extracts the period number from a textual period label.
function parsePeriod(value) {
  const match = normalizeText(value).match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

// Converts a mm:ss clock value into seconds.
function parseClockToSeconds(value) {
  const normalized = normalizeText(value);
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

// Converts a period label and local clock into absolute match seconds.
function parseEventTime(periodLabel, clock, periodLengthMinutes) {
  const period = parsePeriod(periodLabel);
  return (period - 1) * periodLengthMinutes * 60 + parseClockToSeconds(clock);
}

// Parses a Czech match date into a UTC Date instance.
function parseMatchDate(value) {
  const match = normalizeText(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) {
    return null;
  }

  return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`);
}

// Removes duplicate ObjectIds while preserving the original order.
function dedupeObjectIds(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const key = String(value);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

// Keeps only imported goalies that actually played positive minutes.
function sanitizeImportedGoalies(goalies) {
  return (goalies || []).filter((goalie) => Number(goalie.minutesPlayed || 0) > 0);
}

// Assigns an imported conceded goal to a goalie only when that mapping is unambiguous.
function resolveImportedGoalieId(goalLike, goalieEntries) {
  if (goalLike.ourTeam || goalLike.type === "empty net") {
    return null;
  }

  return goalieEntries.length === 1 ? goalieEntries[0].player : null;
}

// Upserts a player by parsed name and number during import.
async function findOrCreatePlayer(playerLike) {
  if (!playerLike?.name) {
    return null;
  }

  const player = await Player.findOneAndUpdate(
    { name: playerLike.name },
    { $set: { number: playerLike.number || "0" }, $setOnInsert: { name: playerLike.name } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return player;
}

// Reads the summary box and derives the core match metadata.
function parseSummary($) {
  const summaryTable = $("table.match_summary").first();
  if (!summaryTable.length) {
    throw new Error("Match summary table not found");
  }

  const teamNames = summaryTable.find("td.stats_leftcol_TeamName").toArray().map((cell) => normalizeText($(cell).text()));
  if (teamNames.length < 2) {
    throw new Error("Unable to parse teams from match summary");
  }

  const centerRows = summaryTable.find("td.stats_centercol").toArray().map((cell) => normalizeText($(cell).text()));
  const scores = summaryTable.find("td.score").toArray().map((cell) => Number.parseInt(normalizeText($(cell).text()), 10) || 0);

  const ourTeamIndex = teamNames.findIndex((name) => name.toLowerCase().includes(OUR_TEAM_MARKER));
  if (ourTeamIndex === -1) {
    throw new Error('Unable to determine our team. Expected a team name containing "Blue Horses".');
  }

  const opponentIndex = ourTeamIndex === 0 ? 1 : 0;
  const homeGame = ourTeamIndex === 0;
  const dateVenue = centerRows[0] || "";
  const date = parseMatchDate(dateVenue);
  const stadiumName = dateVenue.includes(";") ? normalizeText(dateVenue.split(";").slice(1).join(";")) : null;
  const matchInfo = centerRows.find((row) => row.startsWith("Utkání:")) || "";
  const periodsInfo = centerRows.find((row) => row.startsWith("části:")) || "";
  const leagueName = matchInfo.split(";").slice(2).join(";").trim() || null;
  const periodScores = periodsInfo.match(/\d+:\d+/g) || [];

  return {
    homeTeamName: teamNames[0],
    awayTeamName: teamNames[1],
    ourTeamIndex,
    opponentName: teamNames[opponentIndex],
    homeGame,
    ourScore: scores[ourTeamIndex] ?? 0,
    opponentScore: scores[opponentIndex] ?? 0,
    date,
    stadiumName,
    leagueName,
    periodCount: periodScores.length || 3,
  };
}

// Parses either skater or goalie rows from a single stats table.
function parsePlayersTable(table, $, onlyGoalies = false) {
  return $(table)
    .find("tr")
    .slice(1)
    .toArray()
    .map((row) => {
      const cells = $(row).find("td").toArray().map((cell) => normalizeText($(cell).text()));
      if (!cells.length) {
        return null;
      }

      const player = parsePlayerCell(cells[0]);
      if (!player) {
        return null;
      }

      if (onlyGoalies) {
        return {
          ...player,
          minutesPlayed: parseClockToSeconds(cells[5] || "00:00") / 60,
        };
      }

      return player;
    })
    .filter(Boolean);
}

// Parses goal events for both teams from the goals overview tables.
function parseGoalsTables(tables, $, ourTeamIndex, periodLengthMinutes) {
  return tables.flatMap((table, tableIndex) =>
    $(table)
      .find("tr")
      .slice(1)
      .toArray()
      .map((row) => {
        const cells = $(row).find("td").toArray().map((cell) => normalizeText($(cell).text()));
        if (cells.length < 6) {
          return null;
        }

        return {
          type: cells[3] === "-" ? "EV" : cells[3],
          time: parseEventTime(cells[1], cells[2], periodLengthMinutes),
          scorer: parsePlayerCell(cells[4]),
          assist: parsePlayerCell(cells[5]),
          ourTeam: tableIndex === ourTeamIndex,
        };
      })
      .filter(Boolean)
  );
}

// Parses penalty events for both teams from the penalty overview tables.
function parsePenaltiesTables(tables, $, ourTeamIndex, periodLengthMinutes) {
  return tables.flatMap((table, tableIndex) =>
    $(table)
      .find("tr")
      .slice(1)
      .toArray()
      .map((row) => {
        const cells = $(row).find("td").toArray().map((cell) => normalizeText($(cell).text()));
        if (cells.length < 6) {
          return null;
        }

        return {
          type: cells[5],
          time: parseEventTime(cells[1], cells[2], periodLengthMinutes),
          penaltyMinutes: Number.parseInt(cells[4], 10) || 2,
          player: parsePlayerCell(cells[3]),
          ourTeam: tableIndex === ourTeamIndex,
        };
      })
      .filter(Boolean)
  );
}

// Marks parsed goals as equalizing or winning based on running score.
function enrichGoalFlags(goals) {
  const chronologicalGoals = [...goals].sort((left, right) => left.time - right.time);
  let ourRunningScore = 0;
  let opponentRunningScore = 0;
  let lastTrailingEqualizer = null;
  const ourGoals = [];

  for (const goal of chronologicalGoals) {
    goal.equalizingGoal = false;
    goal.winningGoal = false;

    if (goal.ourTeam) {
      const wasTrailing = ourRunningScore < opponentRunningScore;
      ourRunningScore += 1;
      ourGoals.push(goal);
      if (wasTrailing && ourRunningScore === opponentRunningScore) {
        lastTrailingEqualizer = goal;
      }
    } else {
      opponentRunningScore += 1;
    }
  }

  if (ourRunningScore === opponentRunningScore && chronologicalGoals.at(-1) === lastTrailingEqualizer) {
    lastTrailingEqualizer.equalizingGoal = true;
  }

  if (ourRunningScore > opponentRunningScore) {
    const winningGoal = ourGoals[opponentRunningScore] || null;
    if (winningGoal) {
      winningGoal.winningGoal = true;
    }
  }

  return chronologicalGoals;
}

// Parses the full Czech Floorball match HTML into importable domain data.
async function parseCfMatchHtml(rawHtml) {
  const firstLoad = cheerio.load(rawHtml);
  const pageDiv = firstLoad("div.page");
  const $ = cheerio.load(pageDiv.length ? pageDiv.html() : rawHtml);

  const summary = parseSummary($);
  const goalieTables = getSectionTables("STATISTIKY BRANKÁŘŮ", $);
  const playerTables = getSectionTables("STATISTIKY HRÁČŮ", $);
  const homeGoalies = goalieTables[0] ? parsePlayersTable(goalieTables[0], $, true) : [];
  const awayGoalies = goalieTables[1] ? parsePlayersTable(goalieTables[1], $, true) : [];
  const ourGoalies = summary.ourTeamIndex === 0 ? homeGoalies : awayGoalies;
  const ourPlayers = playerTables[summary.ourTeamIndex] ? parsePlayersTable(playerTables[summary.ourTeamIndex], $) : [];
  const opponentPlayers = playerTables[summary.ourTeamIndex === 0 ? 1 : 0] ? parsePlayersTable(playerTables[summary.ourTeamIndex === 0 ? 1 : 0], $) : [];

  const derivedMatchLength = ourGoalies.reduce((maxMinutes, goalie) => Math.max(maxMinutes, goalie.minutesPlayed || 0), 0);
  const periodLengthMinutes = summary.periodCount ? Math.max(1, Math.round((derivedMatchLength || 45) / summary.periodCount)) : 15;
  const goals = enrichGoalFlags(parseGoalsTables(getSectionTables("PŘEHLED BRANEK", $), $, summary.ourTeamIndex, periodLengthMinutes));
  const penalties = parsePenaltiesTables(getSectionTables("PŘEHLED VYLOUČENÍ", $), $, summary.ourTeamIndex, periodLengthMinutes);

  return {
    ...summary,
    matchLength: derivedMatchLength || summary.periodCount * periodLengthMinutes,
    ourPlayers,
    opponentPlayers,
    ourGoalies,
    goals,
    penalties,
  };
}

// Converts a numeric score into the stored match result label.
function resolveMatchResult(ourScore, opponentScore) {
  if (ourScore > opponentScore) {
    return "Win";
  }

  if (ourScore < opponentScore) {
    return "Loss";
  }

  return "Draw";
}

// Runs the full single-match CF import flow and returns a normalized API result.
async function importCfMatch({ link, html, team, year, persist = true }) {
  if (!team || !year) {
    return {
      error: {
        status: 400,
        body: { message: "Both team and year are required" },
      },
    };
  }

  if (!link && !html) {
    return {
      error: {
        status: 400,
        body: { message: "Either link or html must be provided" },
      },
    };
  }

  const rawHtml = html || await loadHtml(link);
  const parsedMatch = await parseCfMatchHtml(rawHtml);
  const season = await findTeamSeasonByYear(team, year) || await Season.create({
    team,
    year: String(year),
    leagueLevel: 0,
    leagueName: parsedMatch.leagueName,
  });

  if (!persist) {
    return {
      data: {
        id: null,
        persisted: false,
        opponent: parsedMatch.opponentName,
        score: `${parsedMatch.ourScore}:${parsedMatch.opponentScore}`,
        parsedMatch,
      },
    };
  }

  const opponent = await Team.findOneAndUpdate(
    { name: parsedMatch.opponentName },
    { $set: { name: parsedMatch.opponentName } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const stadium = parsedMatch.stadiumName
    ? await Stadium.findOneAndUpdate(
        { name: parsedMatch.stadiumName },
        { $set: { name: parsedMatch.stadiumName } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    : null;

  const presentPlayers = [];
  for (const playerLike of parsedMatch.ourPlayers) {
    const player = await findOrCreatePlayer(playerLike);
    if (player) {
      presentPlayers.push(player._id);
    }
  }

  const goaliesMinutes = [];
  for (const goalieLike of sanitizeImportedGoalies(parsedMatch.ourGoalies)) {
    const goalie = await findOrCreatePlayer(goalieLike);
    if (goalie) {
      presentPlayers.push(goalie._id);
      goaliesMinutes.push({
        player: goalie._id,
        minutesPlayed: goalieLike.minutesPlayed,
      });
    }
  }

  const matchQuery = {
    season: season._id,
    opponent: opponent._id,
    homeGame: parsedMatch.homeGame,
    ...(parsedMatch.date ? { date: parsedMatch.date } : {}),
  };

  let match = await Match.findOne(matchQuery);
  if (!match) {
    match = new Match(matchQuery);
  }

  match.stadium = stadium?._id;
  match.date = parsedMatch.date;
  match.matchLength = parsedMatch.matchLength;
  match.ourScore = parsedMatch.ourScore;
  match.opponentScore = parsedMatch.opponentScore;
  match.result = resolveMatchResult(parsedMatch.ourScore, parsedMatch.opponentScore);
  match.presentPlayers = dedupeObjectIds(presentPlayers);
  match.goaliesMinutes = goaliesMinutes;
  await match.save();

  await Penalty.deleteMany({ match: match._id });
  await Goal.deleteMany({ match: match._id });

  const goalDocs = [];
  for (const goalLike of parsedMatch.goals) {
    const scorer = goalLike.ourTeam ? await findOrCreatePlayer(goalLike.scorer) : null;
    const assist = goalLike.ourTeam ? await findOrCreatePlayer(goalLike.assist) : null;
    goalDocs.push({
      type: goalLike.type,
      time: goalLike.time,
      scorer: scorer?._id,
      assist: assist?._id,
      goalie: resolveImportedGoalieId(goalLike, goaliesMinutes),
      match: match._id,
      ourTeam: goalLike.ourTeam,
      winningGoal: goalLike.winningGoal,
      equalizingGoal: goalLike.equalizingGoal,
    });
  }

  const penaltyDocs = [];
  for (const penaltyLike of parsedMatch.penalties) {
    const player = penaltyLike.ourTeam ? await findOrCreatePlayer(penaltyLike.player) : null;
    penaltyDocs.push({
      type: penaltyLike.type,
      time: penaltyLike.time,
      penaltyMinutes: penaltyLike.penaltyMinutes,
      player: player?._id,
      match: match._id,
      ourTeam: penaltyLike.ourTeam,
    });
  }

  if (goalDocs.length) {
    await Goal.insertMany(goalDocs);
  }

  if (penaltyDocs.length) {
    await Penalty.insertMany(penaltyDocs);
  }

  return {
    data: {
      id: String(match._id),
      persisted: true,
      opponent: parsedMatch.opponentName,
      score: `${parsedMatch.ourScore}:${parsedMatch.opponentScore}`,
      importedPlayers: match.presentPlayers.length,
      importedGoals: goalDocs.length,
      importedPenalties: penaltyDocs.length,
    },
  };
}

// Returns matches with optional server-side filtering.
export async function getMatches(req, res) {
  try {
    const dataset = await loadApiDataset();
    const matches = listMatches(dataset, {
      squad: req.query.squad,
      seasonId: req.query.seasonId,
      playerId: req.query.playerId,
    });
    res.status(200).json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
}

// Returns one fully serialized match by id.
export async function getMatchById(req, res) {
  try {
    const dataset = await loadApiDataset();
    const match = getMatchDetail(dataset, req.params.matchId);
    if (!match) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Resource not found." });
    }
    res.status(200).json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch match" });
  }
}

// Saves a match payload together with its nested goals and penalties.
async function saveMatchDocument(match, payload) {
  const normalized = await buildMatchWritePayload(payload, match);
  if (normalized.error) {
    return normalized;
  }

  Object.assign(match, normalized.match);
  await match.save();

  await Goal.deleteMany({ match: match._id });
  await Penalty.deleteMany({ match: match._id });

  if (normalized.goals.length) {
    await Goal.insertMany(normalized.goals.map((goal) => ({
      ...goal,
      match: match._id,
    })));
  }

  if (normalized.penalties.length) {
    await Penalty.insertMany(normalized.penalties.map((penalty) => ({
      ...penalty,
      match: match._id,
    })));
  }

  const dataset = await loadApiDataset();
  return { data: getMatchDetail(dataset, String(match._id)) };
}

// Creates a new match from the API match payload.
export async function createMatch(req, res) {
  try {
    const result = await saveMatchDocument(new Match(), req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create match" });
  }
}

// Replaces an existing match with the posted full payload.
export async function updateMatch(req, res) {
  try {
    const match = await Match.findById(req.params.matchId).populate(["season", "opponent", "stadium"]);
    if (!match) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Resource not found." });
    }

    const result = await saveMatchDocument(match, req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update match" });
  }
}

// Applies a partial update by merging the request into the existing match payload.
export async function patchMatch(req, res) {
  try {
    const dataset = await loadApiDataset();
    const existingPayload = getMatchDetail(dataset, req.params.matchId);
    if (!existingPayload) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Resource not found." });
    }

    const mergedPayload = {
      ...existingPayload,
      ...req.body,
      presentPlayerIds: req.body.presentPlayerIds ?? existingPayload.presentPlayerIds,
      goalieMinutes: req.body.goalieMinutes ?? existingPayload.goalieMinutes,
      goals: req.body.goals ?? existingPayload.goals,
      penalties: req.body.penalties ?? existingPayload.penalties,
    };

    const match = await Match.findById(req.params.matchId).populate(["season", "opponent", "stadium"]);
    const result = await saveMatchDocument(match, mergedPayload);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to patch match" });
  }
}

// body: { link: "https://fis.ceskyflorbal.cz/index.php?pageid=2519&onlycontent=1&record_id=457546&type=2", team: "A", year: 2023 }
// Imports one match from a Czech Floorball link or raw HTML.
export async function importMatchFromCFLink(req, res) {
  try {
    const result = await importCfMatch(req.body);
    if (result.error) {
      return res.status(result.error.status).json(result.error.body);
    }

    res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to import match from CF link" });
  }
}

// Imports multiple Czech Floorball matches and returns per-item results.
export async function importMatchesFromCFLinks(req, res) {
  try {
    const { links, team, year, persist = true } = req.body;

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ message: "links must be a non-empty array" });
    }

    const results = [];
    for (let index = 0; index < links.length; index += 1) {
      const item = links[index];
      const payload = typeof item === "string"
        ? { link: item, team, year, persist }
        : {
            ...item,
            team: item.team ?? team,
            year: item.year ?? year,
            persist: item.persist ?? persist,
          };

      try {
        const result = await importCfMatch(payload);
        if (result.error) {
          results.push({
            index,
            link: payload.link || null,
            success: false,
            error: result.error.body.message,
          });
          continue;
        }

        results.push({
          index,
          link: payload.link || null,
          success: true,
          ...result.data,
        });
      } catch (error) {
        results.push({
          index,
          link: payload.link || null,
          success: false,
          error: error.message || "Failed to import match from CF link",
        });
      }
    }

    res.status(200).json({
      total: results.length,
      imported: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to import matches from CF links" });
  }
}