import mongoose from "mongoose";

const UserBadgeSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        category: { type: String, enum: ["practice", "streak", "learning", "accuracy"], required: true },
        tier: { type: Number, required: true }, // 0-9
        badgeName: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

UserBadgeSchema.index({ userId: 1, category: 1, tier: 1 }, { unique: true });

export default mongoose.model("UserBadge", UserBadgeSchema);
