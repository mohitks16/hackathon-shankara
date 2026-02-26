import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaArrowLeft, FaTrash, FaStickyNote, FaMapSigns, FaClipboardList,
    FaCheckCircle, FaRegCircle, FaSpinner,
} from "react-icons/fa";
import axios from "axios";
import { PlannerView } from "./GrowthBlueprint/ExamPlanner";

const PLAN_BASE = "http://localhost:5000/api/exam-plan-history";
const ROADMAP_BASE = "http://localhost:5000/api/roadmap-history";

const SECTION_COLORS = {
    academic: "text-cyan-400", skills: "text-violet-400", exams: "text-amber-400",
    education: "text-emerald-400", finance: "text-yellow-400",
    timeline: "text-pink-400", lifestyle: "text-sky-400", growth: "text-lime-400",
};

// ─── Exam Plan Detail ─────────────────────────────────────────────────
function ExamPlanDetail({ plan, onBack }) {
    // Build a config object that PlannerView understands from saved data
    const config = {
        examType: plan.examType || "General",
        examName: plan.examName || plan.name || "Saved Plan",
        plannerName: plan.name || plan.examName || plan.examType || "Saved Exam Plan",
        syllabus: plan.syllabus || "",
        deadline: plan.deadline ? new Date(plan.deadline) : new Date(),
        weeklyHours: (plan.hoursPerDay || 2) * 7,
    };

    return (
        <div className="w-full">
            <PlannerView
                config={config}
                onBack={onBack}
                savedPlan={plan}
            />
        </div>
    );
}

// ─── Roadmap Detail ────────────────────────────────────────────────────
function RoadmapDetail({ roadmap, onBack }) {
    const [note, setNote] = useState(roadmap.note || "");
    const [editing, setEditing] = useState(false);
    const saveNote = async () => {
        await axios.patch(`${ROADMAP_BASE}/${roadmap._id}/note`, { note });
        setEditing(false);
    };
    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer">
                <FaArrowLeft /> Back to list
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">{roadmap.name || roadmap.career}</h2>
            <p className="text-gray-400 text-sm mb-6">Created {new Date(roadmap.createdAt).toLocaleDateString()}</p>
            <div className="space-y-4">
                {(roadmap.sections || []).map((sec, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className={`font-bold mb-3 ${SECTION_COLORS[sec.id] || "text-white"}`}>{sec.emoji} {sec.title}</h3>
                        <ul className="space-y-1">
                            {sec.points?.map((p, j) => (
                                <li key={j} className="text-gray-300 text-sm flex gap-2">
                                    <span className="text-gray-500 shrink-0">›</span>{p}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                {editing ? (
                    <div className="flex gap-2">
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="flex-1 bg-[#1f2937] border border-gray-600 rounded-xl p-2 text-sm text-white resize-none"
                            rows={3}
                            placeholder="Add a note…"
                        />
                        <button onClick={saveNote} className="px-3 py-1 bg-purple-600 rounded-lg text-xs text-white cursor-pointer">Save</button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition cursor-pointer">
                        <FaStickyNote /> {note ? `Note: ${note}` : "Add note to roadmap"}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function PastGrowth({ onBack, initialTab }) {
    const [tab, setTab] = useState(initialTab || "plans");
    const [view, setView] = useState("list"); // "list" | "detail"
    const [plans, setPlans] = useState([]);
    const [roadmaps, setRoadmaps] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingP, setLoadingP] = useState(true);
    const [loadingR, setLoadingR] = useState(true);
    const [openingId, setOpeningId] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        axios.get(PLAN_BASE)
            .then(r => setPlans(r.data))
            .catch(e => console.error("list plans error:", e))
            .finally(() => setLoadingP(false));
        axios.get(ROADMAP_BASE)
            .then(r => setRoadmaps(r.data))
            .catch(e => console.error("list roadmaps error:", e))
            .finally(() => setLoadingR(false));
    }, []);

    const openPlan = async (id) => {
        if (openingId) return;
        setOpeningId(id);
        setFetchError(null);
        try {
            const { data } = await axios.get(`${PLAN_BASE}/${id}`);
            setSelected({ type: "plan", data });
            setView("detail");
        } catch (err) {
            console.error("openPlan error:", err);
            setFetchError("Failed to load this exam plan. Please try again.");
        } finally {
            setOpeningId(null);
        }
    };

    const openRoadmap = async (id) => {
        if (openingId) return;
        setOpeningId(id);
        setFetchError(null);
        try {
            const { data } = await axios.get(`${ROADMAP_BASE}/${id}`);
            setSelected({ type: "roadmap", data });
            setView("detail");
        } catch (err) {
            console.error("openRoadmap error:", err);
            setFetchError("Failed to load this roadmap. Please try again.");
        } finally {
            setOpeningId(null);
        }
    };

    const deletePlan = async (e, id) => {
        e.stopPropagation();
        await axios.delete(`${PLAN_BASE}/${id}`);
        setPlans(prev => prev.filter(p => p._id !== id));
    };

    const deleteRoadmap = async (e, id) => {
        e.stopPropagation();
        await axios.delete(`${ROADMAP_BASE}/${id}`);
        setRoadmaps(prev => prev.filter(r => r._id !== id));
    };

    const renderList = (items, loading, onOpen, onDelete, emptyIcon, emptyMsg) => {
        if (loading) return <p className="text-center text-gray-400 py-10">Loading…</p>;
        if (!items.length) return (
            <div className="text-center text-gray-400 py-10 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-4xl mb-3">{emptyIcon}</p>
                <p>{emptyMsg}</p>
            </div>
        );
        return (
            <div className="space-y-3">
                {fetchError && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center mb-2">
                        {fetchError}
                        <button onClick={() => setFetchError(null)} className="ml-2 underline text-red-400">Dismiss</button>
                    </div>
                )}
                {items.map(item => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white/5 border rounded-2xl p-5 flex items-center gap-3 transition cursor-pointer ${openingId === item._id
                            ? "border-purple-400/50 bg-purple-500/5"
                            : "border-white/10 hover:border-purple-400/40 hover:bg-white/[0.07]"
                            }`}
                        onClick={() => onOpen(item._id)}
                    >
                        {tab === "plans"
                            ? <FaClipboardList className="text-purple-400 shrink-0 text-lg" />
                            : <FaMapSigns className="text-pink-400 shrink-0 text-lg" />}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{item.name || item.examType || item.career}</p>
                            <p className="text-xs text-gray-500">{item.examType || item.career} · {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        {openingId === item._id ? (
                            <FaSpinner className="text-purple-400 animate-spin shrink-0" />
                        ) : (
                            <button
                                onClick={(e) => onDelete(e, item._id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition cursor-pointer shrink-0"
                            >
                                <FaTrash />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={view === "detail" ? () => { setView("list"); setSelected(null); } : onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 cursor-pointer transition"
                >
                    <FaArrowLeft /> {view === "detail" ? "Back to list" : "Back"}
                </button>

                {view === "list" && (
                    <>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
                            Past Growth Plans
                        </h1>
                        <p className="text-gray-400 text-sm mb-6">Your saved exam plans and career roadmaps.</p>
                        <div className="flex gap-3 mb-6">
                            {[["plans", "📋 Exam Plans"], ["roadmaps", "🗺️ Career Roadmaps"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setTab(val)}
                                    className={`px-5 py-2 rounded-xl font-medium transition cursor-pointer ${tab === val
                                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                                        : "border border-gray-600 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {tab === "plans" && renderList(
                            plans, loadingP, openPlan, deletePlan,
                            "📋", "No exam plans saved yet. Click 'Save Plan' in Exam Planner."
                        )}
                        {tab === "roadmaps" && renderList(
                            roadmaps, loadingR, openRoadmap, deleteRoadmap,
                            "🗺️", "No roadmaps saved yet. Click 'Save to Past Roadmaps' in Destiny Designer."
                        )}
                    </>
                )}

                {view === "detail" && selected?.type === "plan" && (
                    <ExamPlanDetail plan={selected.data} onBack={() => { setView("list"); setSelected(null); }} />
                )}
                {view === "detail" && selected?.type === "roadmap" && (
                    <RoadmapDetail roadmap={selected.data} onBack={() => { setView("list"); setSelected(null); }} />
                )}
            </div>
        </div>
    );
}
