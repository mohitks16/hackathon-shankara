import mongoose from "mongoose";

const StorySubtopicSchema = new mongoose.Schema({
    title: String,
    content: String,
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    solution: { type: String, default: "" },
    note: { type: String, default: "" },
});

const StorySchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        name: { type: String, default: "" },
        topic: { type: String, required: true },
        difficulty: { type: String, default: "novice" },
        subtopics: [StorySubtopicSchema],
        wrongAnswers: [{ subtopic: String, userAnswer: String, correctAnswer: String }],
        xpEarned: { type: Number, default: 0 },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Story", StorySchema);
