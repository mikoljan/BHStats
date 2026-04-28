import { Router } from "express";
import {
  createSeason,
  getSeasonById,
  getSeasons,
  getTeamSeasonByYear,
  updateSeason,
} from "../controllers/seasonController.js";

const router = Router();

router.get("/", getSeasons);
router.post("/", createSeason);
router.get("/team/:team/year/:year", getTeamSeasonByYear);
router.get("/:id", getSeasonById);
router.put("/:id", updateSeason);

export default router;