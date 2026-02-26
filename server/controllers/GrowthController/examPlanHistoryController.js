import ExamPlan from "../../modal/GrowthBlueprintModal/ExamPlan.js";

const USER_ID = "guest";

export async function saveExamPlan(req, res) {
    try {
        const { examType, syllabus, hoursPerDay, deadline, weeks, name } = req.body;
        const plan = await ExamPlan.create({
            userId: USER_ID, examType, syllabus, hoursPerDay, deadline,
            weeks: weeks || [],
            name: name || `${examType} — ${new Date().toLocaleDateString()}`,
        });
        res.status(201).json({ id: plan._id });
    } catch (err) {
        console.error("saveExamPlan error:", err);
        res.status(500).json({ error: "Failed to save exam plan" });
    }
}

export async function listExamPlans(req, res) {
    try {
        const list = await ExamPlan.find({ userId: USER_ID })
            .select("_id name examType deadline createdAt")
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch exam plans" });
    }
}

export async function getExamPlanById(req, res) {
    try {
        const plan = await ExamPlan.findOne({ _id: req.params.id, userId: USER_ID });
        if (!plan) return res.status(404).json({ error: "Not found" });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch plan" });
    }
}

export async function deleteExamPlan(req, res) {
    try {
        await ExamPlan.findOneAndDelete({ _id: req.params.id, userId: USER_ID });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
}

export async function renameExamPlan(req, res) {
    try {
        await ExamPlan.findOneAndUpdate({ _id: req.params.id, userId: USER_ID }, { name: req.body.name });
        res.json({ message: "Renamed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to rename" });
    }
}

// Update a single task status (called from ExamPlanner UI on toggle)
export async function updateTaskStatus(req, res) {
    try {
        const { weekIndex, taskIndex, status } = req.body;
        const plan = await ExamPlan.findOne({ _id: req.params.id, userId: USER_ID });
        if (!plan) return res.status(404).json({ error: "Not found" });
        plan.weeks[weekIndex].tasks[taskIndex].status = status;
        await plan.save();
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
    }
}
