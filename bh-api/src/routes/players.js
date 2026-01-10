import { Router } from "express";
import { getPlayers } from "../controllers/playerController.js";

const router = Router();

router.get("/", getPlayers);

export default router;