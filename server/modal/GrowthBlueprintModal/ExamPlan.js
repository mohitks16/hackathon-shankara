import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: String,
    subject: String,
    description: String,
    estimatedMinutes: Number,
    duration: String,
    type: String,
    priority: String,
    // status enum covers all possible values from both task-status toggle and save
    status: {
        type: String,
        enum: ["pending", "done", "skip", "skipped", "revision", "practice", "more-practice"],
        default: "pending",
    },
    note: { type: String, default: "" },
});

const WeekSchema = new mongoose.Schema({
    weekLabel: String,
    tasks: [TaskSchema],
});

const ExamPlanSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        name: { type: String, default: "" },
        examType: { type: String, default: "General" },
        examName: { type: String, default: "" },
        syllabus: { type: String, default: "" },
        hoursPerDay: { type: Number, default: 4 },
        deadline: { type: String, default: "" },
        weeks: [WeekSchema],
        currentWeek: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("ExamPlan", ExamPlanSchema);
