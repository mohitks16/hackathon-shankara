import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
    FaArrowLeft, FaArrowRight, FaCheck, FaClock, FaCalendarAlt,
    FaEdit, FaRedo, FaForward, FaBookmark, FaDumbbell,
    FaChartPie, FaTimes, FaClipboardList, FaGraduationCap,
    FaUniversity, FaTrophy, FaFire, FaChevronRight, FaSave,
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/planner";

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function getWeeksBetween(start, end) {
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

function getDeadlineText(deadline) {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Exam day is here! 🔥";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} and ${remDays} day${remDays !== 1 ? "s" : ""} left`;
    return `${days} day${days !== 1 ? "s" : ""} left`;
}

function groupWeeksIntoMonths(totalWeeks) {
    const months = [];
    let w = 1;
    let m = 1;
    while (w <= totalWeeks) {
        const end = Math.min(w + 3, totalWeeks);
        const weeks = [];
        for (let i = w; i <= end; i++) weeks.push(i);
        months.push({ month: m, weeks });
        w = end + 1;
        m++;
    }
    return months;
}

// ── Status config ──
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: null },
    done: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-400/30", icon: <FaCheck /> },
    skipped: { label: "Skipped", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-400/30", icon: <FaForward /> },
    revision: { label: "Revision", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-400/30", icon: <FaBookmark /> },
    practice: { label: "More Practice", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-400/30", icon: <FaDumbbell /> },
};

// ─────────────────────────────────────────────
// SETUP MENU
// ─────────────────────────────────────────────
function SetupMenu({ onComplete, onBack }) {
    const [step, setStep] = useState(1);
    const [examType, setExamType] = useState("");
    const [examName, setExamName] = useState("");
    const [syllabus, setSyllabus] = useState("");
    const [weeklyHours, setWeeklyHours] = useState(21);
    const [deadline, setDeadline] = useState("");
    const [plannerName, setPlannerName] = useState("");
    const heroRef = useRef();

    useEffect(() => {
        gsap.from(heroRef.current, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" });
    }, []);

    const examTypes = [
        { id: "college", label: "College", emoji: "🎓", icon: <FaGraduationCap /> },
        { id: "university", label: "University", emoji: "🏛️", icon: <FaUniversity /> },
        { id: "competitive", label: "Competitive", emoji: "🏆", icon: <FaTrophy /> },
    ];

    const hourOptions = [14, 21, 28, 35, 42];

    const canNext = () => {
        if (step === 1) return examType && examName.trim();
        if (step === 2) return syllabus.trim().length >= 10;
        if (step === 3) return weeklyHours && deadline;
        if (step === 4) return plannerName.trim();
        return false;
    };

    const handleCreate = () => {
        onComplete({
            examType,
            examName: examName.trim(),
            syllabus: syllabus.trim(),
            weeklyHours,
            deadline: new Date(deadline),
            plannerName: plannerName.trim(),
        });
    };

    const stepIndicator = (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2">
                    <motion.div
                        animate={{
                            scale: step === s ? 1.2 : 1,
                            backgroundColor: step >= s ? "rgb(6,182,212)" : "rgba(255,255,255,0.1)",
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    >
                        {step > s ? <FaCheck className="text-xs" /> : s}
                    </motion.div>
                    {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-cyan-400" : "bg-white/10"} transition-colors`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div ref={heroRef} className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    EXAM PLANNER
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Build your perfect study strategy</p>
            </div>

            {stepIndicator}

            <AnimatePresence mode="wait">
                {/* STEP 1: Exam Type & Name */}
                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
                            <label className="block text-gray-400 mb-3 text-sm font-medium">What type of exam are you preparing for?</label>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {examTypes.map((t) => (
                                    <motion.div
                                        key={t.id}
                                        whileHover={{ scale: 1.04, boxShadow: "0 0 22px rgba(34,211,238,0.3)" }}
                                        onClick={() => setExamType(t.id)}
                                        className={`cursor-pointer rounded-2xl p-5 border transition-all text-center ${examType === t.id
                                            ? "bg-white/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                            : "bg-white/5 border-white/10"
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{t.emoji}</div>
                                        <div className="font-semibold text-sm">{t.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                            <label className="block text-gray-400 mb-2 text-sm font-medium">What's the name of your exam?</label>
                            <input
                                type="text"
                                placeholder="e.g. Class 8th Half Year Exam, 4th Semester Practicals, JEE Mains..."
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                            />
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: Syllabus */}
                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
                            <label className="block text-gray-400 mb-2 text-sm font-medium">
                                What syllabus will you cover?
                            </label>
                            <p className="text-gray-500 text-xs mb-3">List subjects, chapters, topics — the more detail you give, the smarter your planner gets.</p>
                            <textarea
                                rows={8}
                                placeholder="e.g.&#10;Mathematics: Quadratic Equations, Trigonometry, Statistics&#10;Science: Light, Electricity, Chemical Reactions&#10;English: The Necklace, Grammar, Letter Writing..."
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none"
                            />
                            <p className="text-gray-500 text-xs mt-2">{syllabus.length} characters</p>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: Hours & Deadline */}
                {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
                            <label className="block text-gray-400 mb-3 text-sm font-medium">
                                How many hours per week can you seriously dedicate?
                            </label>
                            <div className="flex gap-3 flex-wrap mb-8">
                                {hourOptions.map((h) => (
                                    <motion.button
                                        key={h}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setWeeklyHours(h)}
                                        className={`px-5 py-3 rounded-xl font-semibold transition-all ${weeklyHours === h
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                            : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {h} hrs
                                    </motion.button>
                                ))}
                            </div>
                            <label className="block text-gray-400 mb-2 text-sm font-medium">
                                <FaCalendarAlt className="inline mr-2" />
                                When does your exam start?
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white focus:outline-none focus:border-cyan-400 transition"
                            />
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: Planner Name */}
                {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
                            <label className="block text-gray-400 mb-2 text-sm font-medium">Name your planner</label>
                            <input
                                type="text"
                                placeholder="e.g. Operation Board Crush, JEE Domination Plan..."
                                value={plannerName}
                                onChange={(e) => setPlannerName(e.target.value)}
                                className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                            />
                            <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                                <p className="text-gray-400 text-sm font-medium mb-3">Summary</p>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p><span className="text-cyan-400 font-medium">Exam:</span> {examName} ({examType})</p>
                                    <p><span className="text-cyan-400 font-medium">Hours/week:</span> {weeklyHours} hrs</p>
                                    <p><span className="text-cyan-400 font-medium">Deadline:</span> {deadline}</p>
                                    <p><span className="text-cyan-400 font-medium">Syllabus:</span> {syllabus.substring(0, 100)}{syllabus.length > 100 ? "..." : ""}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}
                    className="px-6 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition cursor-pointer"
                >
                    ← {step === 1 ? "Back" : "Previous"}
                </button>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={!canNext()}
                    onClick={step === 4 ? handleCreate : () => setStep((s) => s + 1)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                    {step === 4 ? "🚀 Create Planner" : "Next →"}
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// LOADING SCREEN
// ─────────────────────────────────────────────
function LoadingScreen({ message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent"
            />
            <p className="text-cyan-400 text-lg font-semibold">{message}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// TASK CARD
// ─────────────────────────────────────────────
function TaskCard({ task, status, onStatusChange, onEdit }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    const priorityColors = {
        high: "text-red-400 bg-red-500/10 border-red-500/20",
        medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-2xl p-5 border backdrop-blur-md transition-all ${cfg.bg} ${cfg.border}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{task.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
                            {task.priority}
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FaClock className="text-cyan-400" /> {task.estimatedMinutes} min</span>
                        <span className="flex items-center gap-1"><FaClipboardList className="text-blue-400" /> {task.subject}</span>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${menuOpen
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                >
                    {cfg.icon || <FaChevronRight />}
                </motion.button>
            </div>

            {/* Status Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <StatusBtn label="Done ✅" active={status === "done"} onClick={() => { onStatusChange("done"); setMenuOpen(false); }} color="text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/10" />
                            <StatusBtn label="Skip ⏭️" active={status === "skipped"} onClick={() => { onStatusChange("skipped"); setMenuOpen(false); }} color="text-amber-400 border-amber-400/30 hover:bg-amber-500/10" />
                            {(status === "done") && (
                                <StatusBtn label="Revision 📝" active={status === "revision"} onClick={() => { onStatusChange("revision"); setMenuOpen(false); }} color="text-purple-400 border-purple-400/30 hover:bg-purple-500/10" />
                            )}
                            <StatusBtn label="More Practice 🔄" active={status === "practice"} onClick={() => { onStatusChange("practice"); setMenuOpen(false); }} color="text-orange-400 border-orange-400/30 hover:bg-orange-500/10" />
                            <StatusBtn label="Edit ✏️" onClick={() => { onEdit(task); setMenuOpen(false); }} color="text-blue-400 border-blue-400/30 hover:bg-blue-500/10" />
                            {status !== "pending" && (
                                <StatusBtn label="Reset" onClick={() => { onStatusChange("pending"); setMenuOpen(false); }} color="text-gray-400 border-gray-400/30 hover:bg-gray-500/10" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function StatusBtn({ label, active, onClick, color }) {
    return (
        <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${color} ${active ? "ring-1 ring-current bg-current/10" : ""}`}
        >
            {label}
        </motion.button>
    );
}

// ─────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────
function EditModal({ task, onSave, onClose, loading }) {
    const [instruction, setInstruction] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a2332] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">Edit Task</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer"><FaTimes /></button>
                </div>
                <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
                    <p className="text-sm font-medium text-cyan-400 mb-1">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.description}</p>
                </div>
                <label className="block text-gray-400 text-sm mb-2">How would you like to change this task?</label>
                <textarea
                    rows={3}
                    placeholder="e.g. Break this into 2 smaller tasks, focus more on formulas, reduce time..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0f172a] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none mb-4"
                />
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={!instruction.trim() || loading}
                    onClick={() => onSave(instruction.trim())}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-40 transition cursor-pointer"
                >
                    {loading ? "Updating..." : "Apply Changes →"}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// SVG DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ data, size = 160 }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const r = 60;
    const circumference = 2 * Math.PI * r;
    let accumulated = 0;

    return (
        <svg width={size} height={size} viewBox="0 0 160 160">
            {data.map((d, i) => {
                const pct = d.value / total;
                const offset = circumference * (1 - accumulated);
                accumulated += pct;
                return (
                    <circle
                        key={i}
                        cx="80" cy="80" r={r}
                        fill="none" stroke={d.color} strokeWidth="14"
                        strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                        style={{ transition: "all 0.6s ease" }}
                    />
                );
            })}
            <text x="80" y="75" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
                {total > 0 ? Math.round((data.find(d => d.label === "Done")?.value || 0) / total * 100) : 0}%
            </text>
            <text x="80" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="11">completed</text>
        </svg>
    );
}

// ─────────────────────────────────────────────
// PROGRESS SECTION
// ─────────────────────────────────────────────
function ProgressSection({ weeksData, taskStatuses, config, onClose }) {
    // Compute stats
    const allTasks = [];
    Object.entries(weeksData).forEach(([wk, data]) => {
        if (data.tasks) {
            data.tasks.forEach((t) => {
                allTasks.push({ ...t, week: parseInt(wk), status: taskStatuses[t.id] || "pending" });
            });
        }
    });

    const counts = { done: 0, skipped: 0, revision: 0, practice: 0, pending: 0 };
    allTasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    const totalTasks = allTasks.length;
    const totalMinutes = allTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
    const doneMinutes = allTasks.filter(t => t.status === "done" || t.status === "revision").reduce((s, t) => s + (t.estimatedMinutes || 0), 0);

    const donutData = [
        { label: "Done", value: counts.done + counts.revision, color: "#34d399" },
        { label: "Skipped", value: counts.skipped, color: "#fbbf24" },
        { label: "Practice", value: counts.practice, color: "#fb923c" },
        { label: "Pending", value: counts.pending, color: "#4b5563" },
    ];

    // Per-week bar data
    const weekNums = Object.keys(weeksData).map(Number).sort((a, b) => a - b);
    const maxTasksInWeek = Math.max(...weekNums.map(w => weeksData[w]?.tasks?.length || 0), 1);

    const filterTasks = (status) => allTasks.filter(t => t.status === status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="w-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                    Progress Dashboard
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Tasks", value: totalTasks, color: "text-cyan-400" },
                    { label: "Completed", value: `${totalTasks ? Math.round(((counts.done + counts.revision) / totalTasks) * 100) : 0}%`, color: "text-emerald-400" },
                    { label: "Hours Planned", value: `${Math.round(totalMinutes / 60)}h`, color: "text-blue-400" },
                    { label: "Hours Done", value: `${Math.round(doneMinutes / 60)}h`, color: "text-green-400" },
                ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Donut */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center">
                    <p className="text-gray-400 text-sm font-medium mb-4">Task Distribution</p>
                    <DonutChart data={donutData} />
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {donutData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.label} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Bar Chart */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-gray-400 text-sm font-medium mb-4">Weekly Completion</p>
                    <div className="flex items-end gap-2 h-32">
                        {weekNums.map((w) => {
                            const tasks = weeksData[w]?.tasks || [];
                            const done = tasks.filter(t => ["done", "revision"].includes(taskStatuses[t.id])).length;
                            const total = tasks.length || 1;
                            const pct = (done / total) * 100;
                            return (
                                <div key={w} className="flex-1 flex flex-col items-center gap-1">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(pct, 4)}%` }}
                                        transition={{ duration: 0.6, delay: w * 0.05 }}
                                        className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-500"
                                        style={{ minHeight: "4px" }}
                                    />
                                    <span className="text-[10px] text-gray-500">W{w}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filtered Review Lists */}
            {[
                { key: "revision", label: "📝 Marked for Revision", config: STATUS_CONFIG.revision },
                { key: "skipped", label: "⏭️ Skipped Tasks", config: STATUS_CONFIG.skipped },
                { key: "practice", label: "🔄 Needs More Practice", config: STATUS_CONFIG.practice },
            ].map(({ key, label, config: sc }) => {
                const tasks = filterTasks(key);
                if (tasks.length === 0) return null;
                return (
                    <div key={key} className={`mb-4 rounded-2xl border p-5 ${sc.bg} ${sc.border}`}>
                        <h3 className={`font-bold text-sm mb-3 ${sc.color}`}>{label} ({tasks.length})</h3>
                        <div className="space-y-2">
                            {tasks.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500 text-xs">W{t.week}</span>
                                    <span className="text-white">{t.title}</span>
                                    <span className="text-gray-500 text-xs ml-auto">{t.subject}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// PLANNER VIEW
// ─────────────────────────────────────────────
function PlannerView({ config, onBack }) {
    const totalWeeks = useMemo(() => getWeeksBetween(new Date(), config.deadline), [config.deadline]);
    const months = useMemo(() => groupWeeksIntoMonths(totalWeeks), [totalWeeks]);

    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [weeksData, setWeeksData] = useState({}); // { weekNum: { tasks: [], loaded: bool } }
    const [taskStatuses, setTaskStatuses] = useState({}); // { taskId: "done"|"skipped"|"revision"|"practice"|"pending" }
    const [loading, setLoading] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [error, setError] = useState(null);
    const [planSaving, setPlanSaving] = useState(false);
    const [planSaved, setPlanSaved] = useState(false);

    const handleSavePlan = async () => {
        if (planSaving || planSaved) return;
        setPlanSaving(true);
        try {
            const weeks = Object.entries(weeksData)
                .filter(([, v]) => v.loaded)
                .map(([weekNum, v]) => ({
                    weekLabel: `Week ${weekNum}`,
                    tasks: (v.tasks || []).map(t => ({
                        title: t.title,
                        subject: t.subject,
                        duration: t.duration,
                        type: t.type,
                        status: taskStatuses[t.id] || "pending",
                    })),
                }));
            await axios.post("http://localhost:5000/api/exam-plan-history/save", {
                examType: config.examType,
                examName: config.examName,
                syllabus: config.syllabus,
                deadline: config.deadline?.toISOString?.() || config.deadline,
                hoursPerDay: config.weeklyHours / 7,
                weeks,
            });
            setPlanSaved(true);
        } catch (e) {
            console.error("Exam plan save error:", e);
        } finally {
            setPlanSaving(false);
        }
    };

    // Get previously covered topics for context
    const getPreviousTopics = (weekNum) => {
        const topics = [];
        for (let w = 1; w < weekNum; w++) {
            if (weeksData[w]?.tasks) {
                weeksData[w].tasks.forEach((t) => topics.push(t.subject || t.title));
            }
        }
        return topics;
    };

    // Generate week plan on click
    const handleWeekClick = async (weekNum) => {
        setSelectedWeek(weekNum);
        setShowProgress(false);
        if (weeksData[weekNum]?.loaded) return; // already generated

        setLoading(true);
        setError(null);
        try {
            const { data: tasks } = await axios.post(`${BASE}/week-plan`, {
                examType: config.examType,
                examName: config.examName,
                syllabus: config.syllabus,
                weeklyHours: config.weeklyHours,
                weekNumber: weekNum,
                totalWeeks,
                previousWeekTopics: getPreviousTopics(weekNum),
            });
            setWeeksData((prev) => ({
                ...prev,
                [weekNum]: { tasks, loaded: true },
            }));
            // Initialize statuses
            const newStatuses = {};
            tasks.forEach((t) => { if (!taskStatuses[t.id]) newStatuses[t.id] = "pending"; });
            setTaskStatuses((prev) => ({ ...prev, ...newStatuses }));
        } catch (err) {
            console.error(err);
            setError("Failed to generate week plan. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEditSave = async (instruction) => {
        if (!editingTask) return;
        setEditLoading(true);
        try {
            const { data: updated } = await axios.post(`${BASE}/edit-task`, {
                task: editingTask,
                instruction,
            });
            // Update task in weeksData
            setWeeksData((prev) => {
                const copy = { ...prev };
                Object.keys(copy).forEach((wk) => {
                    if (copy[wk].tasks) {
                        copy[wk] = {
                            ...copy[wk],
                            tasks: copy[wk].tasks.map((t) =>
                                t.id === editingTask.id ? { ...t, ...updated } : t
                            ),
                        };
                    }
                });
                return copy;
            });
            setEditingTask(null);
        } catch (err) {
            console.error(err);
        } finally {
            setEditLoading(false);
        }
    };

    // Overall progress
    const allTaskIds = Object.values(weeksData).flatMap((w) => (w.tasks || []).map((t) => t.id));
    const doneCount = allTaskIds.filter((id) => ["done", "revision"].includes(taskStatuses[id])).length;
    const overallPct = allTaskIds.length ? Math.round((doneCount / allTaskIds.length) * 100) : 0;

    const currentMonth = months.find((m) => m.month === selectedMonth);

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition cursor-pointer">
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                            {config.plannerName}
                        </h1>
                        <p className="text-gray-500 text-sm">{config.examName} · {config.examType}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
                        <FaFire className="text-orange-400" />
                        <span className="text-orange-300 text-sm font-medium">{getDeadlineText(config.deadline)}</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSavePlan}
                        disabled={planSaving || planSaved || Object.keys(weeksData).length === 0}
                        className={`rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-semibold transition cursor-pointer ${planSaved
                                ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-400"
                                : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 disabled:opacity-40"
                            }`}
                    >
                        <FaSave />
                        {planSaved ? "Saved!" : planSaving ? "Saving..." : "Save Plan"}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowProgress(true); setSelectedWeek(null); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 text-cyan-400 hover:bg-cyan-500/10 transition cursor-pointer"
                    >
                        <FaChartPie /> Progress
                    </motion.button>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Overall Progress</span>
                    <span className="text-cyan-400 font-bold text-sm">{overallPct}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500"
                        animate={{ width: `${overallPct}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
                <p className="text-gray-500 text-xs mt-2">{doneCount} of {allTaskIds.length} tasks completed across all generated weeks</p>
            </div>

            {/* Show Progress Section */}
            <AnimatePresence>
                {showProgress && (
                    <ProgressSection
                        weeksData={weeksData}
                        taskStatuses={taskStatuses}
                        config={config}
                        onClose={() => setShowProgress(false)}
                    />
                )}
            </AnimatePresence>

            {!showProgress && (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Month Navigation */}
                    <div className="md:w-48 shrink-0">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Months</p>
                        <div className="flex md:flex-col gap-2">
                            {months.map((m) => (
                                <motion.button
                                    key={m.month}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => { setSelectedMonth(m.month); setSelectedWeek(null); }}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${selectedMonth === m.month
                                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                        : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                        }`}
                                >
                                    Month {m.month}
                                    <span className="block text-[10px] text-gray-500 mt-0.5">
                                        Week {m.weeks[0]}–{m.weeks[m.weeks.length - 1]}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Weeks + Tasks */}
                    <div className="flex-1 min-w-0">
                        {/* Week Cards */}
                        {currentMonth && (
                            <div className="mb-6">
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                                    Month {selectedMonth} — Weeks
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    {currentMonth.weeks.map((w) => {
                                        const weekData = weeksData[w];
                                        const hasData = weekData?.loaded;
                                        const weekTasks = weekData?.tasks || [];
                                        const weekDone = weekTasks.filter(t => ["done", "revision"].includes(taskStatuses[t.id])).length;
                                        const weekPct = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;

                                        return (
                                            <motion.button
                                                key={w}
                                                whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleWeekClick(w)}
                                                className={`relative px-5 py-4 rounded-2xl border transition-all min-w-[100px] text-center cursor-pointer ${selectedWeek === w
                                                    ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <span className="block font-bold text-sm text-white">Week {w}</span>
                                                {hasData && (
                                                    <span className={`block text-[10px] mt-1 ${weekPct === 100 ? "text-emerald-400" : "text-gray-500"}`}>
                                                        {weekPct}% done
                                                    </span>
                                                )}
                                                {!hasData && (
                                                    <span className="block text-[10px] mt-1 text-gray-600">tap to generate</span>
                                                )}
                                                {/* Progress dot */}
                                                {hasData && weekPct === 100 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                                                        <FaCheck className="text-[8px] text-black" />
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-4 text-red-300 text-sm text-center">
                                {error}
                                <button onClick={() => setError(null)} className="ml-3 underline text-red-400 cursor-pointer">Dismiss</button>
                            </div>
                        )}

                        {/* Loading */}
                        {loading && <LoadingScreen message="Generating your study plan..." />}

                        {/* Task List */}
                        {!loading && selectedWeek && weeksData[selectedWeek]?.tasks && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-gray-400 text-sm font-medium">
                                        Week {selectedWeek} Tasks ({weeksData[selectedWeek].tasks.length})
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        Click the arrow on each task to mark status
                                    </p>
                                </div>
                                {weeksData[selectedWeek].tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        status={taskStatuses[task.id] || "pending"}
                                        onStatusChange={(s) =>
                                            setTaskStatuses((prev) => ({ ...prev, [task.id]: s }))
                                        }
                                        onEdit={setEditingTask}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {/* Empty state */}
                        {!loading && !selectedWeek && (
                            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
                                <FaCalendarAlt className="text-4xl text-gray-600 mb-4" />
                                <p className="text-gray-500 text-sm">Select a week to generate your study plan</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingTask && (
                    <EditModal
                        task={editingTask}
                        onSave={handleEditSave}
                        onClose={() => setEditingTask(null)}
                        loading={editLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN EXAMPLANNER COMPONENT
// ─────────────────────────────────────────────
export default function ExamPlanner({ onBack }) {
    const [stage, setStage] = useState("setup"); // "setup" | "planner"
    const [config, setConfig] = useState(null);

    const handleSetupComplete = (cfg) => {
        setConfig(cfg);
        setStage("planner");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-start justify-center px-4 md:px-6 py-10">
            <AnimatePresence mode="wait">
                {stage === "setup" && (
                    <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                        <SetupMenu onComplete={handleSetupComplete} onBack={onBack} />
                    </motion.div>
                )}
                {stage === "planner" && config && (
                    <motion.div key="planner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                        <PlannerView config={config} onBack={() => setStage("setup")} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
