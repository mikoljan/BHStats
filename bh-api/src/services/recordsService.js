// Builds the dedicated records payload with isolated calculators per record table.

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

function formatClock(totalSeconds) {
  const safeValue = Math.max(0, Math.round(totalSeconds || 0));
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return "";
  }

  if (startDate === endDate) {
    return startDate || "";
  }

  return `${startDate || "?"} -> ${endDate || "?"}`;
}

function formatOpponentRange(startOpponent, endOpponent) {
  if (!startOpponent && !endOpponent) {
    return "";
  }

  if (startOpponent === endOpponent) {
    return startOpponent || "";
  }

  return `${startOpponent || "?"} -> ${endOpponent || "?"}`;
}

function compareMatchesChronologically(left, right) {
  const leftDate = left?.date ? new Date(left.date).getTime() : 0;
  const rightDate = right?.date ? new Date(right.date).getTime() : 0;
  const leftCreatedAt = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightCreatedAt = right?.createdAt ? new Date(right.createdAt).getTime() : 0;

  return leftDate - rightDate || leftCreatedAt - rightCreatedAt;
}

function getPlayedPlayerIds(match) {
  const playerIds = new Set();

  for (const player of match.presentPlayers || []) {
    const playerId = stringifyId(player);
    if (playerId) {
      playerIds.add(playerId);
    }
  }

  for (const goalieEntry of match.goaliesMinutes || []) {
    const playerId = stringifyId(goalieEntry.player);
    if (playerId) {
      playerIds.add(playerId);
    }
  }

  return [...playerIds];
}

function buildFilteredContext(dataset, scope = "ALL") {
  const matches = [...dataset.matches]
    .filter((match) => scope === "ALL" || match.season?.team === scope)
    .sort(compareMatchesChronologically)
    .map((match, matchIndex) => ({
      ...(match?.toObject ? match.toObject() : match),
      _matchIndex: matchIndex,
    }));
  const matchIds = new Set(matches.map((match) => stringifyId(match._id)));
  const goals = dataset.goals
    .filter((goal) => matchIds.has(stringifyId(goal.match)))
    .sort((left, right) => {
      const leftMatch = matches.find((match) => stringifyId(match._id) === stringifyId(left.match));
      const rightMatch = matches.find((match) => stringifyId(match._id) === stringifyId(right.match));
      return compareMatchesChronologically(leftMatch, rightMatch) || (left.time || 0) - (right.time || 0);
    });
  const penalties = dataset.penalties
    .filter((penalty) => matchIds.has(stringifyId(penalty.match)))
    .sort((left, right) => {
      const leftMatch = matches.find((match) => stringifyId(match._id) === stringifyId(left.match));
      const rightMatch = matches.find((match) => stringifyId(match._id) === stringifyId(right.match));
      return compareMatchesChronologically(leftMatch, rightMatch) || (left.time || 0) - (right.time || 0);
    });

  const matchesById = new Map(matches.map((match) => [stringifyId(match._id), match]));
  const playerMatchLines = new Map();
  const playerSeasonStats = new Map();

  function ensurePlayerMatchLine(playerId, match) {
    const key = `${playerId}:${stringifyId(match._id)}`;
    if (!playerMatchLines.has(key)) {
      playerMatchLines.set(key, {
        id: key,
        playerId,
        matchId: stringifyId(match._id),
        match,
        matchIndex: match._matchIndex,
        goals: 0,
        assists: 0,
        points: 0,
        powerPlayPoints: 0,
        shorthandedPoints: 0,
        goalTimes: [],
      });
    }

    return playerMatchLines.get(key);
  }

  function ensurePlayerSeasonStats(playerId, season, seasonId) {
    const key = `${playerId}:${seasonId}`;
    if (!playerSeasonStats.has(key)) {
      playerSeasonStats.set(key, {
        id: key,
        playerId,
        seasonLabel: season?.year || "Bez sezóny",
        seasonTeam: season?.team || null,
        goals: 0,
        assists: 0,
        points: 0,
      });
    }

    return playerSeasonStats.get(key);
  }

  for (const match of matches) {
    for (const playerId of getPlayedPlayerIds(match)) {
      ensurePlayerMatchLine(playerId, match);
    }
  }

  for (const goal of goals) {
    if (!goal.ourTeam) {
      continue;
    }

    const match = matchesById.get(stringifyId(goal.match));
    if (!match) {
      continue;
    }

    const season = match.season || null;
    const seasonId = stringifyId(season);
    const goalType = normalizeGoalType(goal.type);
    const scorerId = stringifyId(goal.scorer);
    const assistId = stringifyId(goal.assist);

    if (scorerId) {
      const line = ensurePlayerMatchLine(scorerId, match);
      line.goals += 1;
      line.points += 1;
      line.goalTimes.push(goal.time || 0);
      if (goalType === "power play") {
        line.powerPlayPoints += 1;
      }
      if (goalType === "shorthanded") {
        line.shorthandedPoints += 1;
      }

      const seasonStats = ensurePlayerSeasonStats(scorerId, season, seasonId);
      seasonStats.goals += 1;
      seasonStats.points += 1;
    }

    if (assistId) {
      const line = ensurePlayerMatchLine(assistId, match);
      line.assists += 1;
      line.points += 1;
      if (goalType === "power play") {
        line.powerPlayPoints += 1;
      }
      if (goalType === "shorthanded") {
        line.shorthandedPoints += 1;
      }

      const seasonStats = ensurePlayerSeasonStats(assistId, season, seasonId);
      seasonStats.assists += 1;
      seasonStats.points += 1;
    }
  }

  const playerLinesByPlayerId = new Map();
  for (const line of playerMatchLines.values()) {
    const entries = playerLinesByPlayerId.get(line.playerId) || [];
    line.goalTimes.sort((left, right) => left - right);
    entries.push(line);
    playerLinesByPlayerId.set(line.playerId, entries);
  }

  for (const lines of playerLinesByPlayerId.values()) {
    lines.sort((left, right) => left.matchIndex - right.matchIndex);
  }

  return {
    scope,
    matches,
    matchesById,
    goals,
    penalties,
    playersById: dataset.playersById,
    playerLinesByPlayerId,
    playerSeasonStats: [...playerSeasonStats.values()],
  };
}

function getPlayerName(playerId, context) {
  return context.playersById.get(playerId)?.name || "Unknown";
}

function getMatchLabelParts(match) {
  return {
    date: toDateOnly(match?.date),
    opponent: match?.opponent?.name || null,
    season: match?.season?.year || "Bez sezóny",
  };
}

function sumSpecialTeamPoints(context, expectedType) {
  const totals = new Map();

  for (const goal of context.goals) {
    if (!goal.ourTeam || normalizeGoalType(goal.type) !== expectedType) {
      continue;
    }

    const scorerId = stringifyId(goal.scorer);
    const assistId = stringifyId(goal.assist);

    if (scorerId) {
      const row = totals.get(scorerId) || { goals: 0, assists: 0, points: 0 };
      row.goals += 1;
      row.points += 1;
      totals.set(scorerId, row);
    }

    if (assistId) {
      const row = totals.get(assistId) || { goals: 0, assists: 0, points: 0 };
      row.assists += 1;
      row.points += 1;
      totals.set(assistId, row);
    }
  }

  return [...totals.entries()]
    .map(([playerId, totalsByType]) => ({
      id: `${playerId}:${expectedType}`,
      playerName: getPlayerName(playerId, context),
      goals: totalsByType.goals,
      assists: totalsByType.assists,
      points: totalsByType.points,
    }))
    .sort((left, right) => right.points - left.points || right.goals - left.goals || left.playerName.localeCompare(right.playerName))
    .slice(0, 20);
}

function buildPowerPlayPointsTable(context) {
  return createRecordTable(
    "pp-points",
    "Speciální týmy",
    "Body v přesilovkách",
    "Součet gólů a asistencí na našich přesilovkových gólech.",
    "star",
    [
      { key: "playerName", header: "Hráč" },
      { key: "goals", header: "G" },
      { key: "assists", header: "A" },
      { key: "points", header: "B" },
    ],
    sumSpecialTeamPoints(context, "power play")
  );
}

function buildShorthandedPointsTable(context) {
  return createRecordTable(
    "sh-points",
    "Speciální týmy",
    "Body v oslabení",
    "Součet gólů a asistencí na našich gólech v oslabení.",
    "star",
    [
      { key: "playerName", header: "Hráč" },
      { key: "goals", header: "G" },
      { key: "assists", header: "A" },
      { key: "points", header: "B" },
    ],
    sumSpecialTeamPoints(context, "shorthanded")
  );
}

function countMultiGoalGames(context, minimumGoals, maximumGoals = null) {
  const totals = new Map();

  for (const lines of context.playerLinesByPlayerId.values()) {
    for (const line of lines) {
      const matchesThreshold = line.goals >= minimumGoals && (maximumGoals === null || line.goals <= maximumGoals);
      if (!matchesThreshold) {
        continue;
      }

      const row = totals.get(line.playerId) || { count: 0 };
      row.count += 1;
      totals.set(line.playerId, row);
    }
  }

  return [...totals.entries()]
    .map(([playerId, row]) => ({
      id: `${playerId}:${minimumGoals}:${maximumGoals ?? "plus"}`,
      playerName: getPlayerName(playerId, context),
      count: row.count,
    }))
    .sort((left, right) => right.count - left.count || left.playerName.localeCompare(right.playerName))
    .slice(0, 20);
}

function buildHattricksTable(context) {
  return createRecordTable(
    "hattricks",
    "Jeden zápas",
    "Hattricky",
    "Počet zápasů, ve kterých hráč vstřelil alespoň 3 góly.",
    "medal",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Počet" },
    ],
    countMultiGoalGames(context, 3, 3)
  );
}

function buildFourGoalGamesTable(context) {
  return createRecordTable(
    "four-goal-games",
    "Jeden zápas",
    "4 góly v zápase",
    "Počet čtyřgólových zápasů.",
    "medal",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Počet" },
    ],
    countMultiGoalGames(context, 4, 4)
  );
}

function buildFiveGoalGamesTable(context) {
  return createRecordTable(
    "five-goal-games",
    "Jeden zápas",
    "5 gólů v zápase",
    "Počet pětigólových zápasů.",
    "medal",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Počet" },
    ],
    countMultiGoalGames(context, 5, 5)
  );
}

function buildSixGoalGamesTable(context) {
  return createRecordTable(
    "six-goal-games",
    "Jeden zápas",
    "6 gólů v zápase",
    "Počet zápasů, ve kterých hráč vstřelil alespoň 6 gólů.",
    "medal",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Počet" },
    ],
    countMultiGoalGames(context, 6)
  );
}

function buildSingleMatchPointsTable(context) {
  const rows = [];

  for (const lines of context.playerLinesByPlayerId.values()) {
    for (const line of lines) {
      if (!line.points) {
        continue;
      }

      const matchLabels = getMatchLabelParts(line.match);
      rows.push({
        id: `${line.playerId}:${line.matchId}:points`,
        playerName: getPlayerName(line.playerId, context),
        goals: line.goals,
        assists: line.assists,
        points: line.points,
        date: matchLabels.date,
        opponent: matchLabels.opponent,
      });
    }
  }

  rows.sort((left, right) => right.points - left.points || right.goals - left.goals || left.date.localeCompare(right.date) || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "single-match-points",
    "Jeden zápas",
    "Body v 1 zápase",
    "Nejproduktivnější jednotlivé zápasy.",
    "sparkles",
    [
      { key: "playerName", header: "Hráč" },
      { key: "goals", header: "G" },
      { key: "assists", header: "A" },
      { key: "points", header: "B" },
      { key: "date", header: "Datum" },
      { key: "opponent", header: "Soupeř" },
    ],
    rows.slice(0, 20)
  );
}

function buildSeasonPointsTable(context) {
  const rows = [...context.playerSeasonStats]
    .filter((row) => row.points > 0)
    .map((row) => ({
      id: `${row.id}:points`,
      playerName: getPlayerName(row.playerId, context),
      season: row.seasonLabel,
      goals: row.goals,
      assists: row.assists,
      points: row.points,
    }))
    .sort((left, right) => right.points - left.points || right.goals - left.goals || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "season-points",
    "Sezóna",
    "Body v sezóně",
    "Nejlepší bodové sezóny hráčů.",
    "sparkles",
    [
      { key: "playerName", header: "Hráč" },
      { key: "season", header: "Sezóna" },
      { key: "goals", header: "G" },
      { key: "assists", header: "A" },
      { key: "points", header: "B" },
    ],
    rows.slice(0, 20)
  );
}

function buildSeasonAssistsTable(context) {
  const rows = [...context.playerSeasonStats]
    .filter((row) => row.assists > 0)
    .map((row) => ({
      id: `${row.id}:assists`,
      playerName: getPlayerName(row.playerId, context),
      season: row.seasonLabel,
      assists: row.assists,
      points: row.points,
    }))
    .sort((left, right) => right.assists - left.assists || right.points - left.points || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "season-assists",
    "Sezóna",
    "Asistence v sezóně",
    "Nejlepší asistentské sezóny hráčů.",
    "sparkles",
    [
      { key: "playerName", header: "Hráč" },
      { key: "season", header: "Sezóna" },
      { key: "assists", header: "A" },
      { key: "points", header: "B" },
    ],
    rows.slice(0, 20)
  );
}

function buildSeasonGoalsTable(context) {
  const rows = [...context.playerSeasonStats]
    .filter((row) => row.goals > 0)
    .map((row) => ({
      id: `${row.id}:goals`,
      playerName: getPlayerName(row.playerId, context),
      season: row.seasonLabel,
      goals: row.goals,
      points: row.points,
    }))
    .sort((left, right) => right.goals - left.goals || right.points - left.points || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "season-goals",
    "Sezóna",
    "Góly v sezóně",
    "Nejlepší střelecké sezóny hráčů.",
    "sparkles",
    [
      { key: "playerName", header: "Hráč" },
      { key: "season", header: "Sezóna" },
      { key: "goals", header: "G" },
      { key: "points", header: "B" },
    ],
    rows.slice(0, 20)
  );
}

function buildFastestGoalTable(context) {
  const rows = context.goals
    .filter((goal) => goal.ourTeam && stringifyId(goal.scorer))
    .map((goal) => {
      const match = context.matchesById.get(stringifyId(goal.match));
      const labels = getMatchLabelParts(match);
      return {
        id: stringifyId(goal._id),
        playerName: getPlayerName(stringifyId(goal.scorer), context),
        time: formatClock(goal.time || 0),
        date: labels.date,
        opponent: labels.opponent,
      };
    })
    .sort((left, right) => left.time.localeCompare(right.time) || left.date.localeCompare(right.date) || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "fastest-goal",
    "Čas",
    "Nejrychlejší gól",
    "Nejrychlejší góly od začátku zápasu.",
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "time", header: "Čas" },
      { key: "date", header: "Datum" },
      { key: "opponent", header: "Soupeř" },
    ],
    rows.slice(0, 20)
  );
}

function buildFastestMultiGoalTable(context, goalCount, key, title, caption) {
  const rows = [];

  for (const lines of context.playerLinesByPlayerId.values()) {
    for (const line of lines) {
      if (line.goalTimes.length < goalCount) {
        continue;
      }

      const labels = getMatchLabelParts(line.match);
      rows.push({
        id: `${line.playerId}:${line.matchId}:${goalCount}`,
        playerName: getPlayerName(line.playerId, context),
        count: goalCount,
        time: formatClock(line.goalTimes[goalCount - 1]),
        date: labels.date,
        opponent: labels.opponent,
      });
    }
  }

  rows.sort((left, right) => left.time.localeCompare(right.time) || left.date.localeCompare(right.date) || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    key,
    "Čas",
    title,
    caption,
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "time", header: "Čas" },
      { key: "date", header: "Datum" },
      { key: "opponent", header: "Soupeř" },
    ],
    rows.slice(0, 20)
  );
}

function buildPenaltyWindows(match, penalties) {
  const matchEnd = Number(match.matchLength || 0) * 60;
  return penalties
    .filter((penalty) => Number(penalty.penaltyMinutes || 0) > 0 && Number(penalty.penaltyMinutes || 0) < 10)
    .map((penalty) => ({
      ourTeam: Boolean(penalty.ourTeam),
      start: Number(penalty.time || 0),
      end: Math.min(matchEnd || Number(penalty.time || 0) + Number(penalty.penaltyMinutes || 0) * 60, Number(penalty.time || 0) + Number(penalty.penaltyMinutes || 0) * 60),
    }));
}

function getSkaterStateAtTime(goalTime, penaltyWindows) {
  let ourPenalties = 0;
  let opponentPenalties = 0;

  for (const window of penaltyWindows) {
    if (goalTime > window.start && goalTime <= window.end) {
      if (window.ourTeam) {
        ourPenalties += 1;
      } else {
        opponentPenalties += 1;
      }
    }
  }

  const ourDisadvantage = Math.max(0, ourPenalties - opponentPenalties);
  const opponentDisadvantage = Math.max(0, opponentPenalties - ourPenalties);

  return {
    ourSkaters: Math.max(3, 5 - ourDisadvantage),
    opponentSkaters: Math.max(3, 5 - opponentDisadvantage),
  };
}

function buildThreeOnFiveGoalTable(context) {
  const penaltiesByMatchId = new Map();
  for (const penalty of context.penalties) {
    const matchId = stringifyId(penalty.match);
    const entries = penaltiesByMatchId.get(matchId) || [];
    entries.push(penalty);
    penaltiesByMatchId.set(matchId, entries);
  }

  const rows = [];

  for (const goal of context.goals) {
    if (!goal.ourTeam || !stringifyId(goal.scorer)) {
      continue;
    }

    const match = context.matchesById.get(stringifyId(goal.match));
    if (!match) {
      continue;
    }

    const skaterState = getSkaterStateAtTime(goal.time || 0, buildPenaltyWindows(match, penaltiesByMatchId.get(stringifyId(match._id)) || []));
    if (skaterState.ourSkaters !== 3 || skaterState.opponentSkaters !== 5) {
      continue;
    }

    const labels = getMatchLabelParts(match);
    rows.push({
      id: `${stringifyId(goal._id)}:3v5`,
      playerName: getPlayerName(stringifyId(goal.scorer), context),
      time: formatClock(goal.time || 0),
      date: labels.date,
      opponent: labels.opponent,
    });
  }

  rows.sort((left, right) => left.time.localeCompare(right.time) || left.date.localeCompare(right.date) || left.playerName.localeCompare(right.playerName));

  return createRecordTable(
    "goal-3v5",
    "Speciální týmy",
    "Gól ve 3 proti 5",
    "Naše góly vstřelené v oslabení 3 na 5.",
    "star",
    [
      { key: "playerName", header: "Hráč" },
      { key: "time", header: "Čas" },
      { key: "date", header: "Datum" },
      { key: "opponent", header: "Soupeř" },
    ],
    rows.slice(0, 20)
  );
}

function buildBestPlayerStreakRows(context, predicate) {
  const rows = [];

  for (const [playerId, lines] of context.playerLinesByPlayerId.entries()) {
    let bestLength = 0;
    let bestStart = null;
    let bestEnd = null;
    let currentLength = 0;
    let currentStart = null;
    let previousMatchIndex = null;

    for (const line of lines) {
      const isContiguous = previousMatchIndex !== null && line.matchIndex === previousMatchIndex + 1;
      if (predicate(line) && (currentLength === 0 || isContiguous)) {
        currentLength += 1;
        currentStart ??= line;
      } else if (predicate(line)) {
        currentLength = 1;
        currentStart = line;
      } else {
        currentLength = 0;
        currentStart = null;
      }

      if (currentLength > bestLength) {
        bestLength = currentLength;
        bestStart = currentStart;
        bestEnd = line;
      }

      previousMatchIndex = line.matchIndex;
      if (!predicate(line)) {
        previousMatchIndex = line.matchIndex;
      }
    }

    if (!bestLength || !bestStart || !bestEnd) {
      continue;
    }

    const startLabels = getMatchLabelParts(bestStart.match);
    const endLabels = getMatchLabelParts(bestEnd.match);
    rows.push({
      id: `${playerId}:${predicate.name || "streak"}`,
      playerName: getPlayerName(playerId, context),
      count: bestLength,
      date: formatDateRange(startLabels.date, endLabels.date),
      opponent: formatOpponentRange(startLabels.opponent, endLabels.opponent),
    });
  }

  return rows.sort((left, right) => right.count - left.count || left.playerName.localeCompare(right.playerName)).slice(0, 20);
}

function buildScorelessStreakTable(context) {
  return createRecordTable(
    "scoreless-streak",
    "Série",
    "Nejdelší série bez gólu",
    "Nejvíc po sobě jdoucích odehraných zápasů bez gólu.",
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Zápasy" },
      { key: "date", header: "Období" },
      { key: "opponent", header: "Rozpětí soupeřů" },
    ],
    buildBestPlayerStreakRows(context, (line) => line.goals === 0)
  );
}

function buildGoalStreakTable(context) {
  return createRecordTable(
    "goal-streak",
    "Série",
    "Nejdelší gólová série",
    "Nejvíc po sobě jdoucích odehraných zápasů s gólem.",
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Zápasy" },
      { key: "date", header: "Období" },
      { key: "opponent", header: "Rozpětí soupeřů" },
    ],
    buildBestPlayerStreakRows(context, (line) => line.goals > 0)
  );
}

function buildPointStreakTable(context) {
  return createRecordTable(
    "point-streak",
    "Série",
    "Nejdelší bodová série",
    "Nejvíc po sobě jdoucích odehraných zápasů s bodem.",
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Zápasy" },
      { key: "date", header: "Období" },
      { key: "opponent", header: "Rozpětí soupeřů" },
    ],
    buildBestPlayerStreakRows(context, (line) => line.points > 0)
  );
}

function buildAppearanceStreakTable(context) {
  return createRecordTable(
    "appearance-streak",
    "Série",
    "Nejvíce zápasů bez pauzy",
    "Nejdelší série odehraných zápasů bez vynechání.",
    "clock",
    [
      { key: "playerName", header: "Hráč" },
      { key: "count", header: "Zápasy" },
      { key: "date", header: "Období" },
      { key: "opponent", header: "Rozpětí soupeřů" },
    ],
    buildBestPlayerStreakRows(context, () => true)
  );
}

function buildWinStreakTable(context) {
  const rows = [];
  let currentStart = null;
  let currentLength = 0;

  for (const match of context.matches) {
    const won = (match.ourScore || 0) > (match.opponentScore || 0);
    if (won) {
      currentStart ??= match;
      currentLength += 1;
      continue;
    }

    if (currentLength > 0 && currentStart) {
      const lastMatch = context.matches[match._matchIndex - 1];
      const startLabels = getMatchLabelParts(currentStart);
      const endLabels = getMatchLabelParts(lastMatch);
      rows.push({
        id: `win-streak:${stringifyId(currentStart._id)}:${stringifyId(lastMatch._id)}`,
        playerName: context.scope === "ALL" ? "Blue Horses" : `Blue Horses ${context.scope}`,
        count: currentLength,
        date: formatDateRange(startLabels.date, endLabels.date),
        opponent: formatOpponentRange(startLabels.opponent, endLabels.opponent),
      });
    }

    currentStart = null;
    currentLength = 0;
  }

  if (currentLength > 0 && currentStart) {
    const lastMatch = context.matches.at(-1);
    const startLabels = getMatchLabelParts(currentStart);
    const endLabels = getMatchLabelParts(lastMatch);
    rows.push({
      id: `win-streak:${stringifyId(currentStart._id)}:${stringifyId(lastMatch?._id)}`,
      playerName: context.scope === "ALL" ? "Blue Horses" : `Blue Horses ${context.scope}`,
      count: currentLength,
      date: formatDateRange(startLabels.date, endLabels.date),
      opponent: formatOpponentRange(startLabels.opponent, endLabels.opponent),
    });
  }

  rows.sort((left, right) => right.count - left.count || left.date.localeCompare(right.date));

  return createRecordTable(
    "win-streak",
    "Tým",
    "Nejdelší vítězná série",
    "Nejdelší týmové série výher v dostupných datech.",
    "medal",
    [
      { key: "playerName", header: "Tým" },
      { key: "count", header: "Zápasy" },
      { key: "date", header: "Období" },
      { key: "opponent", header: "Rozpětí soupeřů" },
    ],
    rows.slice(0, 20)
  );
}

function buildHeroStats(sections) {
  const ppLeader = sections[0]?.tables[0]?.rows?.[0] || null;
  const hattrickLeader = sections[1]?.tables[0]?.rows?.[0] || null;
  const fastestGoal = sections[2]?.tables[0]?.rows?.[0] || null;
  const topWinStreak = sections[4]?.tables[0]?.rows?.[0] || null;

  return [
    {
      label: "PP body",
      value: ppLeader ? `${ppLeader.points}` : "0",
      note: ppLeader ? ppLeader.playerName : "Bez dat",
    },
    {
      label: "Hattricky",
      value: hattrickLeader ? `${hattrickLeader.count}` : "0",
      note: hattrickLeader ? hattrickLeader.playerName : "Bez dat",
    },
    {
      label: "Nejrychlejší gól",
      value: fastestGoal ? fastestGoal.time : "00:00",
      note: fastestGoal ? fastestGoal.playerName : "Bez dat",
    },
    {
      label: "Vítězná série",
      value: topWinStreak ? `${topWinStreak.count}` : "0",
      note: topWinStreak ? topWinStreak.date : "Bez dat",
    },
  ];
}

export function getRecordsBook(dataset, scope = "ALL") {
  const context = buildFilteredContext(dataset, scope);
  const specialTeamsSection = createRecordSection(
    "special-teams",
    "Speciální týmy",
    "Speciální situace",
    "Rekordy navázané na přesilovky, oslabení a extrémní herní stavy.",
    [
      buildPowerPlayPointsTable(context),
      buildShorthandedPointsTable(context),
      buildThreeOnFiveGoalTable(context),
    ]
  );
  const singleGameSection = createRecordSection(
    "single-game",
    "Jeden zápas",
    "Zápasové rekordy",
    "Výkony a milníky dosažené v jednom utkání.",
    [
      buildHattricksTable(context),
      buildFourGoalGamesTable(context),
      buildFiveGoalGamesTable(context),
      buildSixGoalGamesTable(context),
      buildSingleMatchPointsTable(context),
    ]
  );
  const timingSection = createRecordSection(
    "timing",
    "Čas",
    "Nejrychlejší výkony",
    "Rekordy seřazené podle času od začátku zápasu.",
    [
      buildFastestGoalTable(context),
      buildFastestMultiGoalTable(context, 3, "fastest-hattrick", "Nejrychlejší hattrick", "Čas třetího gólu od začátku zápasu."),
      buildFastestMultiGoalTable(context, 2, "fastest-two-goals", "Nejrychlejší 2 góly", "Čas druhého gólu od začátku zápasu."),
      buildFastestMultiGoalTable(context, 3, "fastest-three-goals", "Nejrychlejší 3 góly", "Čas třetího gólu od začátku zápasu."),
      buildFastestMultiGoalTable(context, 4, "fastest-four-goals", "Nejrychlejší 4 góly", "Čas čtvrtého gólu od začátku zápasu."),
      buildFastestMultiGoalTable(context, 5, "fastest-five-goals", "Nejrychlejších 5 gólů", "Čas pátého gólu od začátku zápasu."),
      buildFastestMultiGoalTable(context, 6, "fastest-six-goals", "Nejrychlejších 6 gólů", "Čas šestého gólu od začátku zápasu."),
    ]
  );
  const seasonSection = createRecordSection(
    "season",
    "Sezóna",
    "Sezónní rekordy",
    "Nejlepší hráčské sezóny podle bodů, gólů a asistencí.",
    [
      buildSeasonPointsTable(context),
      buildSeasonAssistsTable(context),
      buildSeasonGoalsTable(context),
    ]
  );
  const streakSection = createRecordSection(
    "streaks",
    "Série",
    "Sériové rekordy",
    "Nejdelší individuální i týmové série v dostupné historii.",
    [
      buildScorelessStreakTable(context),
      buildGoalStreakTable(context),
      buildPointStreakTable(context),
      buildAppearanceStreakTable(context),
      buildWinStreakTable(context),
    ]
  );

  const sections = [specialTeamsSection, singleGameSection, timingSection, seasonSection, streakSection];

  return {
    scope,
    heroStats: buildHeroStats(sections),
    sections,
  };
}