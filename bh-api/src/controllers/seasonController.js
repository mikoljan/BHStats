import Season from "../models/seasonModel.js";
import { serializeSeason } from "../services/apiService.js";

// Finds a season by squad and displayed year label.
export async function findTeamSeasonByYear(team, year) {
  return Season.findOne({ team, year: String(year) });
}

// Returns all stored seasons in API shape.
export async function getSeasons(req, res) {
  try {
    const seasons = await Season.find();
    res.status(200).json(seasons.map(serializeSeason));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch seasons" });
  }
}

// Returns one season by its database id.
export async function getSeasonById(req, res) {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }
    res.status(200).json(serializeSeason(season));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch season" });
  }
}


// Returns one season by squad and displayed year label.
export async function getTeamSeasonByYear(req, res) {
  try {
    const { team, year } = req.params;
    const season = await findTeamSeasonByYear(team, year);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }
    res.status(200).json(serializeSeason(season));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch season" });
  }
}

// Creates a new season from the posted payload.
export async function createSeason(req, res) {
  try {
    const newSeason = new Season(req.body);
    const savedSeason = await newSeason.save();
    res.status(201).json(serializeSeason(savedSeason));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create season" });
  }
}

// Updates an existing season and returns the serialized result.
export async function updateSeason(req, res) {
  try {
    const updatedSeason = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSeason) {
      return res.status(404).json({ message: "Season not found" });
    }
    res.status(200).json(serializeSeason(updatedSeason));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update season" });
  }
}
