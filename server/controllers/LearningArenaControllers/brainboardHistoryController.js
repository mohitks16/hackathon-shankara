import BrainBoardModel from "../../modal/LearningArenaModal/BrainBoard.js";

const USER_ID = "guest";

export async function saveBrainBoard(req, res) {
    try {
        const { concept, purpose, type, data } = req.body;
        const bb = await BrainBoardModel.create({
            userId: USER_ID, concept, purpose, type, data,
            name: `${concept} (${type}) — ${new Date().toLocaleDateString()}`,
        });
        res.status(201).json({ id: bb._id });
    } catch (err) {
        console.error("saveBrainBoard error:", err);
        res.status(500).json({ error: "Failed to save brainboard" });
    }
}

export async function listBrainBoards(req, res) {
    try {
        const list = await BrainBoardModel.find({ userId: USER_ID })
            .select("_id name concept type createdAt")
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch brainboards" });
    }
}

export async function getBrainBoardById(req, res) {
    try {
        const bb = await BrainBoardModel.findOne({ _id: req.params.id, userId: USER_ID });
        if (!bb) return res.status(404).json({ error: "Not found" });
        res.json(bb);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch brainboard" });
    }
}

export async function deleteBrainBoard(req, res) {
    try {
        await BrainBoardModel.findOneAndDelete({ _id: req.params.id, userId: USER_ID });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
}

export async function addBrainBoardNote(req, res) {
    try {
        const bb = await BrainBoardModel.findOne({ _id: req.params.id, userId: USER_ID });
        if (!bb) return res.status(404).json({ error: "Not found" });
        bb.note = req.body.note;
        await bb.save();
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save note" });
    }
}
