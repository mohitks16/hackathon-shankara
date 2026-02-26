import mongoose from "mongoose";

const ChallengeQuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: String,
    solution: String,
    hint: String,
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    isBookmarked: { type: Boolean, default: false },
    note: { type: String, default: "" },
    subtopic: { type: String, default: "" },
});

const ChallengeSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        name: { type: String, default: "" },
        topic: { type: String, required: true },
        difficulty: { type: String, default: "easy" },
        questions: [ChallengeQuestionSchema],
        score: { type: Number, default: 0 },
        xpEarned: { type: Number, default: 0 },
        coinsEarned: { type: Number, default: 0 },
        weakSubtopics: [String],
        timeTakenSeconds: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Challenge", ChallengeSchema);
