import e from "express";
import Match from "../models/matchModel.js";
import { loadHtml, getDivSection } from "../utils/helpers.js";
import { getTeamSeasonByYear } from "./seasonController.js";
import * as cheerio from "cheerio";

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
    const { link, team, year } = req.body;
    // Placeholder for actual import logic
    console.log(`Importing match from CF link: ${link}, Team: ${team}, Year: ${year}`);

    const html = await loadHtml(link);

    // Parse HTML to get main content inside <div class="page">
    const firstLoad = cheerio.load(html);
    const pageDiv = firstLoad("div.page");

    if (!pageDiv.length) {
      throw new Error('Div with class="page" not found');
    }

    const $ = cheerio.load(pageDiv.html());
    console.log(pageDiv.html());

    /*
        stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' },
        date: { type: Date },
        opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
        homeGame: { type: Boolean },
        matchLength: { type: Number, required: true, default: 36 }, // in minutes
        
        ourScore: { type: Number, required: true, default: 0 },
        opponentScore: { type: Number, required: true, default: 0 },
        // e.g., "Win", "Loss", "Draw", "Penalty Win", "Penalty Loss"
        result: { type: String, enum: ["Win", "Loss", "Draw", "Penalty Win", "Penalty Loss"], required: true },
    
        presentPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    */

    const mainStatsDiv = getDivSection("STATISTIKA UTKÁNÍ", $);

    mainStatsDiv.find("tr").each((i, row) => {
      if (i === 0) return; // header

      const cols = $(row).find("td");
      if (cols.length < 5) return;

      $(mainStatsDiv.find("tr")[0]).find("td")[0].text()

      goals.push({
        period: $(cols[0]).text().trim(),
        time: $(cols[1]).text().trim(),
        team: $(cols[2]).text().trim(),
        number: $(cols[3]).text().trim(),
        player: $(cols[4]).text().trim(),
        assist1: $(cols[5])?.text().trim() || null,
        assist2: $(cols[6])?.text().trim() || null,
      });
    });

    // Season:
    const season = await getTeamSeasonByYear(team, year);
    // Stadium:
    "STATISTIKA UTKÁNÍ";
    const stadium = null;
    // Date:
    const date = null;
    // Opponent:
    const opponent = null;
    // Home game:
    const homeGame = null;
    // Match length:
    const matchLength = 36;
    // Score:
    const ourScore = null;
    const opponentScore = null;
    const result = null;
    // Present players:
    const presentPlayers = [];
    // Goals 
    const goals = [];
    // Penalties
    const penalties = [];
    // Goalies minutes
    const goaliesMinutes = [];


    res.status(200).json({ message: `Importing match from CF link: ${link}, Team: ${team}, Year: ${year}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to import match from CF link" });
  }
}