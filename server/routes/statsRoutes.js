import express from "express";
import { getStats, addXP, addCoins, getWeakSubtopics } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", getStats);
router.post("/xp", addXP);
router.post("/coins", addCoins);
router.get("/weak-subtopics", getWeakSubtopics);

export default router;
