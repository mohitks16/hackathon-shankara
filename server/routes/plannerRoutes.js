import express from "express";
import {
    generateWeekPlan,
    editTask,
} from "../controllers/GrowthController/PlannerController.js";

const router = express.Router();

router.post("/week-plan", generateWeekPlan);
router.post("/edit-task", editTask);

export default router;
