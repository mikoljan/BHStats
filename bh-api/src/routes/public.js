import { Router } from "express";
import {
  getGoalieStatisticsHandler,
  getOverviewHandler,
  getPlayerRecordsHandler,
  getPlayerStatisticsHandler,
  getSeriesHandler,
  getStadiums,
  getTeamRecordsHandler,
  getTeams,
} from "../controllers/publicController.js";

const router = Router();

router.get("/stadiums", getStadiums);
router.get("/teams", getTeams);
router.get("/overview", getOverviewHandler);
router.get("/statistics/players", getPlayerStatisticsHandler);
router.get("/statistics/goalies", getGoalieStatisticsHandler);
router.get("/records/players", getPlayerRecordsHandler);
router.get("/records/teams", getTeamRecordsHandler);
router.get("/series", getSeriesHandler);

export default router;