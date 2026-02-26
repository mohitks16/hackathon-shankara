import express from "express";
import {
    saveStory, listStories, getStoryById, deleteStory, addStoryNote
} from "../controllers/LearningArenaControllers/storyHistoryController.js";

const router = express.Router();

router.post("/save", saveStory);
router.get("/", listStories);
router.get("/:id", getStoryById);
router.delete("/:id", deleteStory);
router.patch("/:id/note", addStoryNote);

export default router;
