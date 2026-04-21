import Match from "../models/matchModel.js";
import Goal from "../models/goalModel.js";
import Penalty from "../models/penaltyModel.js";
import Player from "../models/playerModel.js";
import Season from "../models/seasonModel.js";
import Team from "../models/teamModel.js";
import Stadium from "../models/stadiumModel.js";
import { loadHtml, getDivSection } from "../utils/helpers.js";
import { findTeamSeasonByYear } from "./seasonController.js";
import * as cheerio from "cheerio";

const OUR_TEAM_MARKER = "blue horses";

function normalizeText(value) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function getSectionTables(title, $) {
  const section = getDivSection(title, $);
  if (!section || !section.length) {
    return [];
  }

  return section.find("table").toArray();
}

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

function parsePeriod(value) {
  const match = normalizeText(value).match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function parseClockToSeconds(value) {
  const normalized = normalizeText(value);
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return 0;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function parseEventTime(periodLabel, clock, periodLengthMinutes) {
  const period = parsePeriod(periodLabel);
  return (period - 1) * periodLengthMinutes * 60 + parseClockToSeconds(clock);
}

function parseMatchDate(value) {
  const match = normalizeText(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) {
    return null;
  }

  return new Date(`${match[3]}-${match[2]}-${match[1]}T00:00:00.000Z`);
}

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

function enrichGoalFlags(goals) {
  const chronologicalGoals = [...goals].sort((left, right) => left.time - right.time);
  let ourRunningScore = 0;
  let opponentRunningScore = 0;

  for (const goal of chronologicalGoals) {
    if (goal.ourTeam) {
      ourRunningScore += 1;
      goal.equalizingGoal = ourRunningScore === opponentRunningScore;
      goal.winningGoal = ourRunningScore === opponentRunningScore + 1;
    } else {
      opponentRunningScore += 1;
      goal.equalizingGoal = opponentRunningScore === ourRunningScore;
      goal.winningGoal = false;
    }
  }

  return chronologicalGoals;
}

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

function resolveMatchResult(ourScore, opponentScore) {
  if (ourScore > opponentScore) {
    return "Win";
  }

  if (ourScore < opponentScore) {
    return "Loss";
  }

  return "Draw";
}

export async function getMatches(req, res) {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
}

export async function getMatchById(req, res) {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch match" });
  }
}

export async function createMatch(req, res) {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create match" });
  }
}

export async function updateMatch(req, res) {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update match" });
  }
}

// body: { link: "https://fis.ceskyflorbal.cz/index.php?pageid=2519&onlycontent=1&record_id=457546&type=2", team: "A", year: 2023 }
export async function importMatchFromCFLink(req, res) {
  try {
    const { link, html, team, year, persist = true } = req.body;

    if (!team || !year) {
      return res.status(400).json({ message: "Both team and year are required" });
    }

    if (!link && !html) {
      return res.status(400).json({ message: "Either link or html must be provided" });
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
      return res.status(200).json({
        persisted: false,
        parsedMatch,
      });
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
    for (const goalieLike of parsedMatch.ourGoalies) {
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
      const scorer = await findOrCreatePlayer(goalLike.scorer);
      const assist = await findOrCreatePlayer(goalLike.assist);
      goalDocs.push({
        type: goalLike.type,
        time: goalLike.time,
        scorer: scorer?._id,
        assist: assist?._id,
        match: match._id,
        ourTeam: goalLike.ourTeam,
        winningGoal: goalLike.winningGoal,
        equalizingGoal: goalLike.equalizingGoal,
      });
    }

    const penaltyDocs = [];
    for (const penaltyLike of parsedMatch.penalties) {
      const player = await findOrCreatePlayer(penaltyLike.player);
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

    res.status(200).json({
      persisted: true,
      matchId: match._id,
      opponent: parsedMatch.opponentName,
      score: `${parsedMatch.ourScore}:${parsedMatch.opponentScore}`,
      importedPlayers: match.presentPlayers.length,
      importedGoals: goalDocs.length,
      importedPenalties: penaltyDocs.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to import match from CF link" });
  }
}