import express from "express";
import {
    generateQuestions,
    analyzeCareer,
} from "../controllers/GrowthController/CounsellorController.js";

const router = express.Router();

router.post("/generate-questions", generateQuestions);
router.post("/analyze", analyzeCareer);

export default router;
