import express from "express";
import { getStats, addXP, addCoins, getWeakSubtopics, getLeaderboard } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", getStats);
router.post("/xp", addXP);
router.post("/coins", addCoins);
router.get("/weak-subtopics", getWeakSubtopics);
router.get("/leaderboard", getLeaderboard);

export default router;
