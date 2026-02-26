import express from "express";
import {
    saveChallenge,
    listChallenges,
    getChallengeById,
    renameChallenge,
    deleteChallenge,
    toggleChallengeBookmark,
    addChallengeNote,
} from "../controllers/challengeHistoryController.js";

const router = express.Router();

router.post("/save", saveChallenge);
router.get("/", listChallenges);
router.get("/:id", getChallengeById);
router.patch("/:id/rename", renameChallenge);
router.delete("/:id", deleteChallenge);
router.patch("/:id/bookmark", toggleChallengeBookmark);
router.patch("/:id/note", addChallengeNote);

export default router;
