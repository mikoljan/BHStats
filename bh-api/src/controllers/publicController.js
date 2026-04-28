import {
  getGoalieStatistics,
  getOverview,
  getPlayerStatistics,
  getSeriesMatrix,
  getTeamRecordBook,
  listStadiums,
  listTeams,
  loadApiDataset,
} from "../services/apiService.js";
import { getRecordsBook } from "../services/recordsService.js";

// Normalizes repeated 500 responses for the read-only public endpoints.
function handleServerError(res, error, message) {
  console.error(error);
  res.status(500).json({ message });
}

// Returns the stadium directory used by match endpoints.
export async function getStadiums(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(listStadiums(dataset));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch stadiums");
  }
}

// Returns the team directory used across the app.
export async function getTeams(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(listTeams(dataset));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch teams");
  }
}

// Returns the aggregated overview payload for dashboard pages.
export async function getOverviewHandler(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(getOverview(dataset, {
      scope: req.query.scope,
      seasonId: req.query.seasonId,
    }));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch overview");
  }
}

// Returns computed skater statistics for the requested filters.
export async function getPlayerStatisticsHandler(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(getPlayerStatistics(dataset, {
      scope: req.query.scope,
      seasonId: req.query.seasonId,
      leagueName: req.query.leagueName,
      query: req.query.query,
    }));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch player statistics");
  }
}

// Returns computed goalie statistics for the requested filters.
export async function getGoalieStatisticsHandler(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(getGoalieStatistics(dataset, {
      scope: req.query.scope,
      seasonId: req.query.seasonId,
      leagueName: req.query.leagueName,
      query: req.query.query,
    }));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch goalie statistics");
  }
}

// Returns the dedicated records tables payload for the records page.
export async function getPlayerRecordsHandler(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(getRecordsBook(dataset, req.query.scope || "ALL"));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch player records");
  }
}

// Returns the team record book grouped for frontend rendering.
export async function getTeamRecordsHandler(req, res) {
  try {
    const dataset = await loadApiDataset();
    res.status(200).json(getTeamRecordBook(dataset, req.query.scope || "ALL"));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch team recordbook");
  }
}

// Returns the player series matrix for the selected scope.
export async function getSeriesHandler(req, res) {
  try {
    if (!req.query.scope) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "scope query parameter is required.",
        details: { field: "scope" },
      });
    }

    const dataset = await loadApiDataset();
    res.status(200).json(getSeriesMatrix(dataset, req.query.scope, req.query.query));
  } catch (error) {
    handleServerError(res, error, "Failed to fetch series matrix");
  }
}