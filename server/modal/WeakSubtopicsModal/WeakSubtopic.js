import mongoose from "mongoose";

const WeakSubtopicSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        subtopic: { type: String, required: true },
        source: { type: String, enum: ["quiz", "challenge", "story"], default: "quiz" },
        count: { type: Number, default: 1 }, // how many times got this wrong
        lastSeenAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Compound index to easily find/upsert per user+subtopic+source
WeakSubtopicSchema.index({ userId: 1, subtopic: 1, source: 1 }, { unique: true });

export default mongoose.model("WeakSubtopic", WeakSubtopicSchema);
