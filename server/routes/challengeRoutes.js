import express from "express";
import {
  generateChallenge,
  getChallengeHint,
  listPastChallenges,
  getPastChallengeById,
} from "../controllers/challengeController.js";

const router = express.Router();

router.post("/generate", generateChallenge);
router.post("/hint", getChallengeHint);
router.get("/past", listPastChallenges);
router.get("/past/:id", getPastChallengeById);

export default router;
