import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    FaArrowLeft, FaMapSigns, FaMagic, FaDownload,
    FaBookOpen, FaTools, FaClipboardCheck, FaGraduationCap,
    FaDollarSign, FaClock, FaGlobe, FaChartLine, FaFilePdf, FaSave
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/destiny";

const SECTION_META = {
    academic: { icon: FaBookOpen, color: "from-cyan-500 to-blue-600", bg: "bg-cyan-500/10", border: "border-cyan-400/30", text: "text-cyan-400", line: "#22d3ee" },
    skills: { icon: FaTools, color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", border: "border-violet-400/30", text: "text-violet-400", line: "#a78bfa" },
    exams: { icon: FaClipboardCheck, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", border: "border-amber-400/30", text: "text-amber-400", line: "#fbbf24" },
    education: { icon: FaGraduationCap, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-400", line: "#34d399" },
    finance: { icon: FaDollarSign, color: "from-yellow-500 to-amber-600", bg: "bg-yellow-500/10", border: "border-yellow-400/30", text: "text-yellow-400", line: "#fde047" },
    timeline: { icon: FaClock, color: "from-pink-500 to-rose-600", bg: "bg-pink-500/10", border: "border-pink-400/30", text: "text-pink-400", line: "#f472b6" },
    lifestyle: { icon: FaGlobe, color: "from-sky-500 to-blue-600", bg: "bg-sky-500/10", border: "border-sky-400/30", text: "text-sky-400", line: "#38bdf8" },
    growth: { icon: FaChartLine, color: "from-lime-500 to-green-600", bg: "bg-lime-500/10", border: "border-lime-400/30", text: "text-lime-400", line: "#a3e635" },
};

// ─────────────────────────────────────────────
// INPUT STAGE
// ─────────────────────────────────────────────
function InputStage({ onGenerate, onBack, loading }) {
    const [career, setCareer] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (career.trim()) onGenerate(career.trim());
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            className="w-full max-w-xl text-center"
        >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <div className="text-6xl text-purple-400 mb-6 flex justify-center">
                    <FaMapSigns />
                </div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-3">
                    Destiny Designer
                </h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Enter your dream career and get a complete personalised roadmap —
                    academics, exams, timelines, finances, and more.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        value={career}
                        onChange={e => setCareer(e.target.value)}
                        placeholder="e.g. Software Engineer, Doctor, IAS Officer…"
                        className="w-full bg-[#1f2937] border border-gray-600 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 transition text-base"
                        autoFocus
                    />
                    <motion.button
                        type="submit"
                        disabled={!career.trim() || loading}
                        whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 font-bold text-lg text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <><span className="animate-spin rounded-full w-5 h-5 border-b-2 border-white inline-block" /> Building Roadmap…</>
                        ) : (
                            <><FaMagic /> Design My Destiny</>
                        )}
                    </motion.button>
                </form>
                <button
                    onClick={onBack}
                    className="mt-6 text-gray-500 hover:text-white transition text-sm flex items-center gap-2 mx-auto cursor-pointer"
                >
                    <FaArrowLeft /> Back to Navigator
                </button>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// TIMELINE SECTION CARD (scroll-triggered)
// ─────────────────────────────────────────────
function TimelineCard({ sec, index, isLast }) {
    const meta = SECTION_META[sec.id] || SECTION_META.academic;
    const Icon = meta.icon;
    const isLeft = index % 2 === 0;

    return (
        <div className="relative flex items-start">

            {/* ── Vertical Spine & Node ────────────────────────────────── */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: 0, bottom: 0 }}>
                {/* top connector line (skip for first card) */}
                {index > 0 && (
                    <div className="w-0.5 flex-none" style={{ height: 40, background: `linear-gradient(to bottom, transparent, ${meta.line})` }} />
                )}
                {/* glowing node circle */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center z-10 shadow-lg shrink-0`}
                    style={{ boxShadow: `0 0 14px ${meta.line}80` }}
                >
                    <Icon className="text-white text-sm" />
                </motion.div>
                {/* bottom connector line (skip for last card) */}
                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-8" style={{ background: `linear-gradient(to bottom, ${meta.line}, transparent)` }} />
                )}
            </div>

            {/* ── Card (alternates left / right) ──────────────────────── */}
            <div className={`w-[calc(50%-2.5rem)] ${isLeft ? "mr-auto pr-4" : "ml-auto pl-4"} pt-0 pb-16`}>
                <motion.div
                    initial={{ opacity: 0, x: isLeft ? -60 : 60, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                    className={`${meta.bg} border ${meta.border} backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow`}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`text-xl font-bold ${meta.text}`}>{sec.emoji}</span>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${meta.text} opacity-70`}>Step {index + 1}</p>
                            <h3 className="text-base font-extrabold text-white leading-tight">{sec.title}</h3>
                        </div>
                    </div>
                    {/* Points */}
                    <ul className="space-y-2">
                        {(sec.points || []).map((pt, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: isLeft ? -15 : 15 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + i * 0.06 }}
                                className="flex items-start gap-2 text-sm text-gray-300 leading-snug"
                            >
                                <span className={`${meta.text} font-bold mt-0.5 shrink-0`}>›</span>
                                {pt}
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// DOWNLOAD HELPERS
// ─────────────────────────────────────────────
function downloadTxt(data) {
    const lines = [
        `DESTINY DESIGNER — ${data.career.toUpperCase()} ROADMAP`,
        `${"=".repeat(50)}`,
        "",
    ];
    data.sections.forEach((sec, i) => {
        lines.push(`${i + 1}. ${sec.emoji} ${sec.title}`);
        lines.push("-".repeat(40));
        sec.points.forEach(p => lines.push(`  • ${p}`));
        lines.push("");
    });
    lines.push("Generated by BrainXP — Destiny Designer");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.career.replace(/\s+/g, "_")}_roadmap.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function printRoadmap(data) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${data.career} Roadmap — BrainXP</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: auto; }
    h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 12px; }
    h2 { color: #374151; margin-top: 28px; font-size: 1.1rem; }
    ul { padding-left: 20px; }
    li { margin: 6px 0; color: #4b5563; }
    .footer { margin-top: 40px; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>🗺️ ${data.career} — Career Roadmap</h1>
  ${data.sections.map(sec => `
    <h2>${sec.emoji} ${sec.title}</h2>
    <ul>${sec.points.map(p => `<li>${p}</li>`).join("")}</ul>
  `).join("")}
  <div class="footer">Generated by BrainXP Destiny Designer</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
}

// ─────────────────────────────────────────────
// ROADMAP STAGE (full scrollable page)
// ─────────────────────────────────────────────
function RoadmapStage({ data, onBack, onReset, onSave }) {
    const [dlOpen, setDlOpen] = useState(false);
    const [roadmapSaving, setRoadmapSaving] = useState(false);
    const [roadmapSaved, setRoadmapSaved] = useState(false);

    const handleSave = async () => {
        if (roadmapSaving || roadmapSaved) return;
        setRoadmapSaving(true);
        try { await onSave(); setRoadmapSaved(true); }
        catch (e) { console.error("Roadmap save failed:", e); }
        finally { setRoadmapSaving(false); }
    };

    return (
        <div className="w-full max-w-4xl mx-auto pb-20">
            {/* Sticky Top Bar */}
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/10 px-4 py-3 flex items-center justify-between mb-10">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm cursor-pointer"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text leading-tight">
                        {data.career}
                    </h2>
                    <p className="text-gray-500 text-xs">Career Roadmap · {data.sections?.length} sections</p>
                </div>
                {/* Download dropdown */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDlOpen(o => !o)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg cursor-pointer"
                    >
                        <FaDownload /> Download
                    </motion.button>
                    {dlOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute right-0 top-12 bg-[#1f2937] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[170px]"
                        >
                            <button
                                onClick={() => { printRoadmap(data); setDlOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <FaFilePdf className="text-red-400" /> Save as PDF
                            </button>
                            <div className="h-px bg-gray-700 mx-4" />
                            <button
                                onClick={() => { downloadTxt(data); setDlOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <FaDownload className="text-cyan-400" /> Download .txt
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Hero Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12 px-4"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 text-transparent bg-clip-text mb-3">
                    Your Roadmap
                </h1>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Scroll through your personalised roadmap for becoming a <span className="text-white font-semibold">{data.career}</span>.
                    Each section appears as you read.
                </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative px-4">
                {(data.sections || []).map((sec, i) => (
                    <TimelineCard
                        key={sec.id}
                        sec={sec}
                        index={i}
                        isLast={i === data.sections.length - 1}
                    />
                ))}
            </div>

            {/* Footer CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-8 px-4"
            >
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-3xl p-8">
                    <p className="text-2xl font-extrabold text-white mb-2">🎯 Your destiny is in your hands.</p>
                    <p className="text-gray-400 text-sm mb-6">Save your roadmap and start taking action today.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {/* Save to Past Roadmaps */}
                        <motion.button
                            whileHover={{ scale: roadmapSaved ? 1 : 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSave}
                            disabled={roadmapSaving || roadmapSaved}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition ${roadmapSaved
                                    ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-400 cursor-default"
                                    : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90"
                                }`}
                        >
                            <FaSave />
                            {roadmapSaved ? "✓ Saved to Past Roadmaps!" : roadmapSaving ? "Saving..." : "💾 Save to Past Roadmaps"}
                        </motion.button>
                        <button
                            onClick={() => printRoadmap(data)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-2xl font-bold text-white shadow-lg cursor-pointer hover:opacity-90 transition"
                        >
                            <FaFilePdf /> Save as PDF
                        </button>
                        <button
                            onClick={() => downloadTxt(data)}
                            className="flex items-center gap-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 py-3 rounded-2xl font-medium transition cursor-pointer"
                        >
                            <FaDownload /> Download .txt
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 py-3 rounded-2xl font-medium transition cursor-pointer"
                        >
                            ↩ Try Another Career
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
export default function DestinyDesigner({ onBack, prefillCareer }) {
    const [stage, setStage] = useState("input");
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (career) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${BASE}/generate`, { career });
            setRoadmapData(data);
            setStage("roadmap");
        } catch (err) {
            console.error(err);
            alert("Failed to generate roadmap. Please check the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRoadmap = async () => {
        await axios.post("http://localhost:5000/api/roadmap-history/save", {
            career: roadmapData.career,
            sections: roadmapData.sections,
        });
    };

    React.useEffect(() => {
        if (prefillCareer) handleGenerate(prefillCareer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white w-full">
            <div className={`flex ${stage === "input" ? "items-center justify-center min-h-screen px-4" : "pt-0"}`}>
                {stage === "input" && (
                    <InputStage onGenerate={handleGenerate} onBack={onBack} loading={loading} />
                )}
                {stage === "roadmap" && roadmapData && (
                    <RoadmapStage
                        data={roadmapData}
                        onBack={onBack}
                        onReset={() => { setStage("input"); setRoadmapData(null); }}
                        onSave={handleSaveRoadmap}
                    />
                )}
            </div>
        </div>
    );
}
