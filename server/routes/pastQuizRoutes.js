import express from "express";
import {
  saveAssistedQuiz,
  listAssistedQuizzes,
  getAssistedQuizById,
  renameAssistedQuiz,
  deleteAssistedQuiz,
  toggleQuizBookmark,
  addQuizNote,
} from "../controllers/pastQuizController.js";

const router = express.Router();

router.post("/save", saveAssistedQuiz);
router.get("/", listAssistedQuizzes);
router.get("/:id", getAssistedQuizById);
router.patch("/:id/rename", renameAssistedQuiz);
router.delete("/:id", deleteAssistedQuiz);
router.patch("/:id/bookmark", toggleQuizBookmark);
router.patch("/:id/note", addQuizNote);

export default router;
