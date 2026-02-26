import mongoose from "mongoose";

const BrainBoardSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        name: { type: String, default: "" },
        concept: { type: String, required: true },
        purpose: { type: String, default: "scratch" }, // "scratch" | "revision"
        type: { type: String, enum: ["mindmap", "flashcard"], required: true },
        data: { type: mongoose.Schema.Types.Mixed }, // raw AI JSON stored as-is
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("BrainBoard", BrainBoardSchema);
