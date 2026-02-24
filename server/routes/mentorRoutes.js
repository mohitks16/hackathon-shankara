import express from "express";
import { startSession, chat } from "../controllers/mentorController.js";

const router = express.Router();

router.post("/session", startSession);
router.post("/chat", chat);

export default router;
