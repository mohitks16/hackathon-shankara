import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: String,
    subtopic: String,
    solution: String,
    doYouKnow: String,
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    isBookmarked: { type: Boolean, default: false },
    note: { type: String, default: "" },
});

const AssistedQuizSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        name: { type: String, default: "" }, // user-editable display name
        topic: { type: String, required: true },
        difficulty: { type: String, default: "novice" },
        questions: [QuestionSchema],
        score: { type: Number, default: 0 },       // correct count
        totalXP: { type: Number, default: 0 },
        weakSubtopics: [String],
    },
    { timestamps: true }
);

export default mongoose.model("AssistedQuiz", AssistedQuizSchema);
