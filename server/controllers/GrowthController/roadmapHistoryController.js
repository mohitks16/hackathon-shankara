import CareerRoadmap from "../../modal/GrowthBlueprintModal/CareerRoadmap.js";


export async function saveRoadmap(req, res) {
    try {
        const { career, sections, name } = req.body;
        const roadmap = await CareerRoadmap.create({
            userId: req.user.id, career, sections: sections || [],
            name: name || `${career} Roadmap — ${new Date().toLocaleDateString()}`,
        });
        res.status(201).json({ id: roadmap._id });
    } catch (err) {
        console.error("saveRoadmap error:", err);
        res.status(500).json({ error: "Failed to save roadmap" });
    }
}

export async function listRoadmaps(req, res) {
    try {
        const list = await CareerRoadmap.find({ userId: req.user.id })
            .select("_id career name createdAt")
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch roadmaps" });
    }
}

export async function getRoadmapById(req, res) {
    try {
        const r = await CareerRoadmap.findOne({ _id: req.params.id, userId: req.user.id });
        if (!r) return res.status(404).json({ error: "Not found" });
        res.json(r);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
}

export async function deleteRoadmap(req, res) {
    try {
        await CareerRoadmap.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
}

export async function addRoadmapNote(req, res) {
    try {
        const r = await CareerRoadmap.findOne({ _id: req.params.id, userId: req.user.id });
        if (!r) return res.status(404).json({ error: "Not found" });
        r.note = req.body.note;
        await r.save();
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save note" });
    }
}
