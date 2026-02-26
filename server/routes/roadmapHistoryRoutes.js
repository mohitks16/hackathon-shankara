import express from "express";
import {
    saveRoadmap, listRoadmaps, getRoadmapById, deleteRoadmap, addRoadmapNote
} from "../controllers/GrowthController/roadmapHistoryController.js";

const router = express.Router();

router.post("/save", saveRoadmap);
router.get("/", listRoadmaps);
router.get("/:id", getRoadmapById);
router.delete("/:id", deleteRoadmap);
router.patch("/:id/note", addRoadmapNote);

export default router;
