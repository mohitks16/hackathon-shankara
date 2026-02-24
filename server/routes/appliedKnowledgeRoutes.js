import express from "express";
import { generateAppliedKnowledge, appliedKnowledgeChat } from "../controllers/LearningArenaControllers/appliedKnowledgeController.js";

const router = express.Router();

router.post("/generate", generateAppliedKnowledge);
router.post("/chat", appliedKnowledgeChat);

export default router;
