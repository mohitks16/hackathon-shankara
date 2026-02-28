import express from "express";
import { healthCheck, apiRoot } from "../controllers/healthController.js";
import { generateQuiz } from "../controllers/quizController.js";
import quizRoutes from "./quizRoutes.js";
import pastQuizRoutes from "./pastQuizRoutes.js";
import challengeRoutes from "./challengeRoutes.js";
import pastChallengeRoutes from "./pastChallengeRoutes.js";
import mentorRoutes from "./mentorRoutes.js";
import storyverseRoutes from "./storyverseRoutes.js";
import storyHistoryRoutes from "./storyHistoryRoutes.js";
import brainboardRoutes from "./brainboardRoutes.js";
import brainboardHistoryRoutes from "./brainboardHistoryRoutes.js";
import appliedKnowledgeRoutes from "./appliedKnowledgeRoutes.js";
import plannerRoutes from "./plannerRoutes.js";
import examPlanHistoryRoutes from "./examPlanHistoryRoutes.js";
import counsellorRoutes from "./counsellorRoutes.js";
import destinyRoutes from "./destinyDesignerRoutes.js";
import roadmapHistoryRoutes from "./roadmapHistoryRoutes.js";
import statsRoutes from "./statsRoutes.js";
import brainResetRoutes from "./brainResetRoutes.js";
import badgeRoutes from "./badgeRoutes.js";

const router = express.Router();

// Health and root
router.get("/health", healthCheck);
router.get("/", apiRoot);

// Legacy route
router.post("/generate-quiz", generateQuiz);

// Practice Arena
router.use("/api/quiz", quizRoutes);
router.use("/api/past-quiz", pastQuizRoutes);
router.use("/api/challenges", challengeRoutes);
router.use("/api/past-challenges", pastChallengeRoutes);

// Learning Arena
router.use("/api/mentors", mentorRoutes);
router.use("/api/storyverse", storyverseRoutes);
router.use("/api/story-history", storyHistoryRoutes);
router.use("/api/brainboard", brainboardRoutes);
router.use("/api/brainboard-history", brainboardHistoryRoutes);
router.use("/api/applied-knowledge", appliedKnowledgeRoutes);

// Growth Blueprint
router.use("/api/planner", plannerRoutes);
router.use("/api/exam-plan-history", examPlanHistoryRoutes);
router.use("/api/counsellor", counsellorRoutes);
router.use("/api/destiny", destinyRoutes);
router.use("/api/roadmap-history", roadmapHistoryRoutes);

// Global Stats & Weak Subtopics
router.use("/api/stats", statsRoutes);

// Brain Reset (Revision Module)
router.use("/api/brain-reset", brainResetRoutes);

// Badges
router.use("/api/badges", badgeRoutes);

export default router;
