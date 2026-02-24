import express from "express";
import { generateMindMap, generateFlashCards } from "../controllers/LearningArenaControllers/BrainBoard.js";

const router = express.Router();

router.post("/mindmap", generateMindMap);
router.post("/flashcards", generateFlashCards);

export default router;
