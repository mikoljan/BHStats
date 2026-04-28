import { Router } from "express";
import { getMatches,
        getMatchById,
        createMatch,
        updateMatch,
        patchMatch,
        importMatchFromCFLink,
        importMatchesFromCFLinks } from "../controllers/matchController.js";

const router = Router();

router.get("/", getMatches);
router.get("/:matchId", getMatchById);
router.post("/", createMatch);
router.put("/:matchId", updateMatch);
router.patch("/:matchId", patchMatch);
router.post("/import-cf", importMatchFromCFLink);
router.post("/import-cf-batch", importMatchesFromCFLinks);

export default router;