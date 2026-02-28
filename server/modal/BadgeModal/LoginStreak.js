import mongoose from "mongoose";

const LoginStreakSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", unique: true, index: true },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastLoginDate: { type: String, default: "" }, // YYYY-MM-DD format
    },
    { timestamps: true }
);

export default mongoose.model("LoginStreak", LoginStreakSchema);
