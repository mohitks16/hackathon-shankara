import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaArrowLeft, FaTrash, FaStickyNote, FaBook, FaBrain,
    FaTimesCircle, FaSpinner,
} from "react-icons/fa";
import axios from "axios";

const STORY_BASE = "http://localhost:5000/api/story-history";
const BB_BASE = "http://localhost:5000/api/brainboard-history";

// ─── Story List ───────────────────────────────────────────────────────
function StoryList({ items, loading, onOpen, onDelete, openingId }) {
    if (loading) return <p className="text-center text-gray-400 py-10">Loading…</p>;
    if (!items.length) return (
        <div className="text-center text-gray-400 py-10 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-4xl mb-3">📖</p>
            <p>No past stories yet.</p>
            <p className="text-sm mt-2 text-gray-500">Complete a Storyverse adventure and click 'Save' to see it here.</p>
        </div>
    );
    return (
        <div className="space-y-3">
            {items.map(s => (
                <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/5 border rounded-2xl p-5 flex items-center gap-3 transition cursor-pointer ${openingId === s._id
                        ? "border-violet-400/50 bg-violet-500/5"
                        : "border-white/10 hover:border-violet-400/30"
                        }`}
                    onClick={() => onOpen(s._id)}
                >
                    <FaBook className="text-violet-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{s.name || s.topic}</p>
                        <p className="text-xs text-gray-500">{s.topic} · {s.difficulty} · {s.xpEarned} XP · {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    {openingId === s._id ? (
                        <FaSpinner className="text-violet-400 animate-spin shrink-0" />
                    ) : (
                        <button onClick={e => { e.stopPropagation(); onDelete(s._id); }} className="p-2 text-gray-500 hover:text-red-400 transition cursor-pointer shrink-0"><FaTrash /></button>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

function StoryDetail({ story, onBack }) {
    const [notes, setNotes] = useState(Object.fromEntries((story.subtopics || []).map((s, i) => [i, s.note || ""])));
    const [editingNote, setEditingNote] = useState(null);

    const saveNote = async (i) => {
        await axios.patch(`${STORY_BASE}/${story._id}/note`, { subtopicIndex: i, note: notes[i] });
        setEditingNote(null);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"><FaArrowLeft /> Back to list</button>
            <h2 className="text-2xl font-bold text-white mb-1">{story.name || story.topic}</h2>
            <p className="text-gray-400 text-sm mb-4">{story.difficulty} · {story.xpEarned} XP</p>
            {story.wrongAnswers?.length > 0 && (
                <div className="mb-6 bg-red-500/10 border border-red-400/20 rounded-xl p-4">
                    <p className="text-red-400 font-semibold text-sm mb-2">❌ Wrong Answers</p>
                    {story.wrongAnswers.map((w, i) => (
                        <div key={i} className="text-sm text-gray-300 mb-1">
                            <span className="text-gray-400">{w.subtopic}: </span>
                            <span className="text-red-300 line-through mr-2">{w.userAnswer}</span>
                            <span className="text-emerald-400">→ {w.correctAnswer}</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="space-y-4">
                {story.subtopics?.map((sub, i) => (
                    <div key={i} className={`bg-white/5 border rounded-2xl p-4 ${sub.isCorrect === false ? "border-red-400/20" : "border-white/10"}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {sub.isCorrect === false && <FaTimesCircle className="text-red-400 text-xs" />}
                            <p className="font-semibold text-white text-sm">{sub.title}</p>
                        </div>
                        {sub.solution && <p className="text-gray-300 text-xs bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3 mb-2"><span className="text-cyan-400 font-semibold">Solution: </span>{sub.solution}</p>}
                        <div className="mt-2">
                            {editingNote === i ? (
                                <div className="flex gap-2">
                                    <textarea value={notes[i]} onChange={e => setNotes(prev => ({ ...prev, [i]: e.target.value }))} className="flex-1 bg-[#1f2937] border border-gray-600 rounded-xl p-2 text-sm text-white resize-none" rows={2} placeholder="Add a note…" />
                                    <button onClick={() => saveNote(i)} className="px-3 py-1 bg-violet-600 rounded-lg text-xs text-white cursor-pointer">Save</button>
                                </div>
                            ) : (
                                <button onClick={() => setEditingNote(i)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition cursor-pointer">
                                    <FaStickyNote /> {notes[i] ? `Note: ${notes[i]}` : "Add note"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── BrainBoard List ──────────────────────────────────────────────────
function BrainBoardList({ items, loading, onOpen, onDelete, openingId }) {
    if (loading) return <p className="text-center text-gray-400 py-10">Loading…</p>;
    if (!items.length) return (
        <div className="text-center text-gray-400 py-10 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-4xl mb-3">🧠</p>
            <p>No past BrainBoards yet.</p>
            <p className="text-sm mt-2 text-gray-500">Complete a BrainBoard and click 'Save' to see it here.</p>
        </div>
    );
    return (
        <div className="space-y-3">
            {items.map(b => (
                <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/5 border rounded-2xl p-5 flex items-center gap-3 transition cursor-pointer ${openingId === b._id
                        ? "border-emerald-400/50 bg-emerald-500/5"
                        : "border-white/10 hover:border-emerald-400/30"
                        }`}
                    onClick={() => onOpen(b._id)}
                >
                    <FaBrain className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{b.name || b.concept}</p>
                        <p className="text-xs text-gray-500">{b.concept} · {b.type} · {new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    {openingId === b._id ? (
                        <FaSpinner className="text-emerald-400 animate-spin shrink-0" />
                    ) : (
                        <button onClick={e => { e.stopPropagation(); onDelete(b._id); }} className="p-2 text-gray-500 hover:text-red-400 transition cursor-pointer shrink-0"><FaTrash /></button>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

function BrainBoardDetail({ item, onBack }) {
    const [note, setNote] = useState(item.note || "");
    const [editing, setEditing] = useState(false);
    const saveNote = async () => {
        await axios.patch(`${BB_BASE}/${item._id}/note`, { note });
        setEditing(false);
    };
    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"><FaArrowLeft /> Back to list</button>
            <h2 className="text-2xl font-bold text-white mb-1">{item.name || item.concept}</h2>
            <p className="text-gray-400 text-sm mb-4 capitalize">{item.type} · {item.purpose}</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Content Preview</p>
                <pre className="text-gray-300 text-xs whitespace-pre-wrap overflow-auto max-h-96">{JSON.stringify(item.data, null, 2)}</pre>
            </div>
            <div className="mt-3">
                {editing ? (
                    <div className="flex gap-2">
                        <textarea value={note} onChange={e => setNote(e.target.value)} className="flex-1 bg-[#1f2937] border border-gray-600 rounded-xl p-2 text-sm text-white resize-none" rows={3} placeholder="Add a note…" />
                        <button onClick={saveNote} className="px-3 py-1 bg-emerald-600 rounded-lg text-xs text-white cursor-pointer">Save</button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition cursor-pointer">
                        <FaStickyNote /> {note ? `Note: ${note}` : "Add note"}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function PastLearnings({ onBack, initialTab }) {
    const [tab, setTab] = useState(initialTab || "stories");
    const [view, setView] = useState("list");
    const [stories, setStories] = useState([]);
    const [brainboards, setBrainboards] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingS, setLoadingS] = useState(true);
    const [loadingB, setLoadingB] = useState(true);
    const [openingId, setOpeningId] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        axios.get(STORY_BASE).then(r => setStories(r.data)).catch(console.error).finally(() => setLoadingS(false));
        axios.get(BB_BASE).then(r => setBrainboards(r.data)).catch(console.error).finally(() => setLoadingB(false));
    }, []);

    const openStory = async (id) => {
        if (openingId) return;
        setOpeningId(id);
        setFetchError(null);
        try {
            const { data } = await axios.get(`${STORY_BASE}/${id}`);
            setSelected({ type: "story", data });
            setView("detail");
        } catch (err) {
            console.error("openStory error:", err);
            setFetchError("Failed to load this story. Please try again.");
        } finally {
            setOpeningId(null);
        }
    };

    const openBrainBoard = async (id) => {
        if (openingId) return;
        setOpeningId(id);
        setFetchError(null);
        try {
            const { data } = await axios.get(`${BB_BASE}/${id}`);
            setSelected({ type: "brainboard", data });
            setView("detail");
        } catch (err) {
            console.error("openBrainBoard error:", err);
            setFetchError("Failed to load this BrainBoard. Please try again.");
        } finally {
            setOpeningId(null);
        }
    };

    const deleteStory = async (id) => {
        await axios.delete(`${STORY_BASE}/${id}`);
        setStories(prev => prev.filter(s => s._id !== id));
    };

    const deleteBrainBoard = async (id) => {
        await axios.delete(`${BB_BASE}/${id}`);
        setBrainboards(prev => prev.filter(b => b._id !== id));
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
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 to-pink-500 text-transparent bg-clip-text mb-2">
                            Past Learnings
                        </h1>
                        <p className="text-gray-400 text-sm mb-6">Your story and BrainBoard history.</p>

                        {fetchError && (
                            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 text-red-300 text-sm text-center mb-4">
                                {fetchError}
                                <button onClick={() => setFetchError(null)} className="ml-2 underline text-red-400">Dismiss</button>
                            </div>
                        )}

                        <div className="flex gap-3 mb-6">
                            {[["stories", "📖 Stories"], ["brainboards", "🧠 BrainBoards"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setTab(val)}
                                    className={`px-5 py-2 rounded-xl font-medium transition cursor-pointer ${tab === val
                                        ? "bg-gradient-to-r from-violet-500 to-pink-600 text-white"
                                        : "border border-gray-600 text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {tab === "stories" && <StoryList items={stories} loading={loadingS} onOpen={openStory} onDelete={deleteStory} openingId={openingId} />}
                        {tab === "brainboards" && <BrainBoardList items={brainboards} loading={loadingB} onOpen={openBrainBoard} onDelete={deleteBrainBoard} openingId={openingId} />}
                    </>
                )}
                {view === "detail" && selected?.type === "story" && <StoryDetail story={selected.data} onBack={() => { setView("list"); setSelected(null); }} />}
                {view === "detail" && selected?.type === "brainboard" && <BrainBoardDetail item={selected.data} onBack={() => { setView("list"); setSelected(null); }} />}
            </div>
        </div>
    );
}
