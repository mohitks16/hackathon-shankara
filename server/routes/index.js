import express from "express";
import { healthCheck, apiRoot } from "../controllers/healthController.js";
import { generateQuiz } from "../controllers/quizController.js";
import quizRoutes from "./quizRoutes.js";
import pastQuizRoutes from "./pastQuizRoutes.js";
import challengeRoutes from "./challengeRoutes.js";
// #region agent log
fetch('http://127.0.0.1:7542/ingest/ae9920c6-98d1-43cb-a31f-25abc51be2c0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b588c2' }, body: JSON.stringify({ sessionId: 'b588c2', location: 'routes/index.js:pre-mentor', message: 'before mentorRoutes import', data: {}, hypothesisId: 'H3', timestamp: Date.now() }) }).catch(() => { });
// #endregion
import mentorRoutes from "./mentorRoutes.js";
import storyverseRoutes from "./storyverseRoutes.js";
import brainboardRoutes from "./brainboardRoutes.js";
import appliedKnowledgeRoutes from "./appliedKnowledgeRoutes.js";
// #region agent log
fetch('http://127.0.0.1:7542/ingest/ae9920c6-98d1-43cb-a31f-25abc51be2c0', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b588c2' }, body: JSON.stringify({ sessionId: 'b588c2', location: 'routes/index.js:post-mentor', message: 'mentorRoutes imported', data: {}, hypothesisId: 'H4', timestamp: Date.now() }) }).catch(() => { });
// #endregion

const router = express.Router();

// Health and root
router.get("/health", healthCheck);
router.get("/", apiRoot);

// Legacy route - keep for frontend compatibility
router.post("/generate-quiz", generateQuiz);

// API routes by module
router.use("/api/quiz", quizRoutes);
router.use("/api/past-quiz", pastQuizRoutes);
router.use("/api/challenges", challengeRoutes);
router.use("/api/mentors", mentorRoutes);
router.use("/api/storyverse", storyverseRoutes);
router.use("/api/brainboard", brainboardRoutes);
router.use("/api/applied-knowledge", appliedKnowledgeRoutes);

export default router;
