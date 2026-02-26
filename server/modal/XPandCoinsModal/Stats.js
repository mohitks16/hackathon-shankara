import mongoose from "mongoose";

const HistoryEntrySchema = new mongoose.Schema({
    source: String,  // e.g. "assisted_quiz", "challenge", "story", "mentor"
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const StatsSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", unique: true, index: true },
        totalXP: { type: Number, default: 0 },
        totalCoins: { type: Number, default: 0 },
        history: [HistoryEntrySchema],
    },
    { timestamps: true }
);

export default mongoose.model("Stats", StatsSchema);
