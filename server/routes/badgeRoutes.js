import express from "express";
import {
    recordLogin,
    checkBadges,
    getUserBadges,
    getBadgeProgress,
} from "../controllers/badgeController.js";

const router = express.Router();

router.post("/record-login", recordLogin);
router.post("/check", checkBadges);
router.get("/", getUserBadges);
router.get("/progress", getBadgeProgress);

export default router;
