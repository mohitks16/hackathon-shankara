import mongoose from "mongoose";

const StudyLogSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        topic: { type: String, required: true },
        source: {
            type: String,
            enum: ["quiz", "challenge", "story", "brainboard", "mentor"],
            default: "quiz",
        },
        studiedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

StudyLogSchema.index({ userId: 1, studiedAt: -1 });

export default mongoose.model("StudyLog", StudyLogSchema);
