import express from "express";
import {
    logStudy,
    getNotifications,
    dismissNotification,
    getMistakeBuckets,
    getWeakSubtopics,
    removeWeakSubtopic,
    generateRevision,
} from "../controllers/brainResetController.js";

const router = express.Router();

router.post("/log-study", logStudy);
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/dismiss", dismissNotification);
router.get("/mistake-buckets", getMistakeBuckets);
router.get("/weak-subtopics", getWeakSubtopics);
router.delete("/weak-subtopics/:id", removeWeakSubtopic);
router.post("/generate-revision", generateRevision);

export default router;
