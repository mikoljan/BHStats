import { Router } from "express";
import { getMatches,
        getMatchById, 
        createMatch, 
        updateMatch, 
        importMatchFromCFLink } from "../controllers/matchController.js";

const router = Router();

router.get("/", getMatches);
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.put("/:id", updateMatch);
router.post("/import-cf", importMatchFromCFLink);

export default router;