import express from "express";
import {
  listPastAssistedQuizzes,
  getPastAssistedQuizById,
} from "../controllers/pastQuizController.js";

const router = express.Router();

router.get("/assisted", listPastAssistedQuizzes);
router.get("/assisted/:id", getPastAssistedQuizById);

export default router;
