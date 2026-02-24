import express from "express";
import {
    generateSubtopics,
    generateStory,
    generateStoryQuiz,
} from "../controllers/LearningArenaControllers/StoryVerseController.js";

const router = express.Router();

router.post("/subtopics", generateSubtopics);
router.post("/story", generateStory);
router.post("/quiz", generateStoryQuiz);

export default router;
