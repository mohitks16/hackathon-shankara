import express from "express";
import {
    saveBrainBoard, listBrainBoards, getBrainBoardById, deleteBrainBoard, addBrainBoardNote
} from "../controllers/LearningArenaControllers/brainboardHistoryController.js";

const router = express.Router();

router.post("/save", saveBrainBoard);
router.get("/", listBrainBoards);
router.get("/:id", getBrainBoardById);
router.delete("/:id", deleteBrainBoard);
router.patch("/:id/note", addBrainBoardNote);

export default router;
