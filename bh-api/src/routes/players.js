import { Router } from "express";
import { getPlayerById, getPlayers, getPlayerStats } from "../controllers/playerController.js";

const router = Router();

router.get("/", getPlayers);
router.get("/:playerId/stats", getPlayerStats);
router.get("/:playerId", getPlayerById);

export default router;