import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
    id: String,
    title: String,
    emoji: String,
    points: [String],
});

const CareerRoadmapSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        career: { type: String, required: true },
        name: { type: String, default: "" }, // user-editable alias
        sections: [SectionSchema],
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("CareerRoadmap", CareerRoadmapSchema);
