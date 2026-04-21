import { Router } from "express";
import { deleteAllData } from "../controllers/adminController.js";

const router = Router();

router.delete("/all-data", deleteAllData);

export default router;