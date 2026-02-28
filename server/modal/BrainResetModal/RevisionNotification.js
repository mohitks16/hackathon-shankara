import mongoose from "mongoose";

const RevisionNotificationSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "guest", index: true },
        studyLogId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyLog" },
        topic: { type: String, required: true },
        source: { type: String, default: "quiz" },
        dayInterval: { type: Number, enum: [1, 5, 14, 30], required: true },
        dueDate: { type: Date, required: true },
        dismissed: { type: Boolean, default: false },
        seen: { type: Boolean, default: false },
    },
    { timestamps: true }
);

RevisionNotificationSchema.index({ userId: 1, dismissed: 1, dueDate: 1 });
// Prevent duplicate notifications for same study log + interval
RevisionNotificationSchema.index(
    { studyLogId: 1, dayInterval: 1 },
    { unique: true }
);

export default mongoose.model("RevisionNotification", RevisionNotificationSchema);
