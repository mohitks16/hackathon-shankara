import express from "express";
import {
    saveExamPlan, listExamPlans, getExamPlanById,
    deleteExamPlan, renameExamPlan, updateTaskStatus
} from "../controllers/GrowthController/examPlanHistoryController.js";

const router = express.Router();

router.post("/save", saveExamPlan);
router.get("/", listExamPlans);
router.get("/:id", getExamPlanById);
router.patch("/:id/rename", renameExamPlan);
router.delete("/:id", deleteExamPlan);
router.patch("/:id/task-status", updateTaskStatus);

export default router;
