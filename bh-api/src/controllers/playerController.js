import {
  getPlayerDetail,
  getPlayerStatsDetail,
  listPlayers,
  loadApiDataset,
} from "../services/apiService.js";

// Returns the player list with optional squad and position filters.
export async function getPlayers(req, res) {
  try {
    const dataset = await loadApiDataset();
    const players = listPlayers(dataset, {
      squad: req.query.squad,
      position: req.query.position,
    });
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch players" });
  }
}

// Returns a single player detail by API player id.
export async function getPlayerById(req, res) {
  try {
    const dataset = await loadApiDataset();
    const player = getPlayerDetail(dataset, req.params.playerId);
    if (!player) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Resource not found." });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch player" });
  }
}

// Returns the derived detail payload for one player.
export async function getPlayerStats(req, res) {
  try {
    const dataset = await loadApiDataset();
    const playerStats = getPlayerStatsDetail(dataset, req.params.playerId);
    if (!playerStats) {
      return res.status(404).json({ code: "NOT_FOUND", message: "Resource not found." });
    }

    res.status(200).json(playerStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch player statistics" });
  }
}