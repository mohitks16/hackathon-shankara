import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaArrowLeft, FaTrash, FaEdit, FaBookmark, FaStickyNote,
    FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaTrophy
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/past-challenges";

function ListView({ list, loading, onOpen, onDelete, onRename }) {
    const [renaming, setRenaming] = useState(null);
    const [newName, setNewName] = useState("");

    const handleRename = async (id) => {
        await onRename(id, newName);
        setRenaming(null);
    };

    if (loading) return <p className="text-center text-gray-400 mt-20">Loading…</p>;
    if (!list.length) return (
        <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-4">⚔️</p>
            <p>No past challenges yet. Complete one to see it here!</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {list.map((c) => (
                <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-pink-400/30 transition cursor-pointer"
                >
                    <div className="flex-1" onClick={() => onOpen(c._id)}>
                        {renaming === c._id ? (
                            <input value={newName} onClick={e => e.stopPropagation()} onChange={e => setNewName(e.target.value)} onBlur={() => handleRename(c._id)} onKeyDown={e => e.key === "Enter" && handleRename(c._id)} className="bg-[#1f2937] border border-pink-400/50 rounded-lg px-3 py-1 text-white text-sm w-full" autoFocus />
                        ) : (
                            <p className="font-bold text-white mb-1">{c.name || c.topic}</p>
                        )}
                        <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                            <span>{c.topic}</span><span>·</span><span className="capitalize">{c.difficulty}</span><span>·</span>
                            <span>Score: {c.score}</span><span>·</span>
                            <span className="text-cyan-400">{c.xpEarned} XP</span><span>·</span>
                            <span className="text-yellow-400">{c.coinsEarned} coins</span><span>·</span>
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        {c.weakSubtopics?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">{c.weakSubtopics.map((s, i) => <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-xs">{s}</span>)}</div>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setRenaming(c._id); setNewName(c.name || c.topic); }} className="p-2 text-gray-400 hover:text-pink-400 transition cursor-pointer"><FaEdit /></button>
                        <button onClick={e => { e.stopPropagation(); onDelete(c._id); }} className="p-2 text-gray-400 hover:text-red-400 transition cursor-pointer"><FaTrash /></button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function DetailView({ challenge, onBack }) {
    const [bookmarks, setBookmarks] = useState(Object.fromEntries((challenge.questions || []).map((q, i) => [i, q.isBookmarked])));
    const [notes, setNotes] = useState(Object.fromEntries((challenge.questions || []).map((q, i) => [i, q.note || ""])));
    const [editingNote, setEditingNote] = useState(null);
    const [openQ, setOpenQ] = useState(null);

    const toggleBookmark = async (i) => {
        const r = await axios.patch(`${BASE}/${challenge._id}/bookmark`, { questionIndex: i });
        setBookmarks(prev => ({ ...prev, [i]: r.data.isBookmarked }));
    };

    const saveNote = async (i) => {
        await axios.patch(`${BASE}/${challenge._id}/note`, { questionIndex: i, note: notes[i] });
        setEditingNote(null);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer"><FaArrowLeft /> Back</button>
            <div className="flex items-center gap-3 mb-4">
                <FaTrophy className="text-yellow-400 text-3xl" />
                <div>
                    <h2 className="text-2xl font-bold text-white">{challenge.name || challenge.topic}</h2>
                    <p className="text-gray-400 text-sm capitalize">{challenge.difficulty} · Score: {challenge.score} · {challenge.xpEarned} XP · {challenge.coinsEarned} coins</p>
                </div>
            </div>
            {challenge.weakSubtopics?.length > 0 && (
                <div className="mb-6 bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                    <p className="text-amber-400 font-semibold text-sm mb-2">⚠️ Weak Areas</p>
                    <div className="flex flex-wrap gap-2">{challenge.weakSubtopics.map((s, i) => <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs">{s}</span>)}</div>
                </div>
            )}
            <div className="space-y-4">
                {challenge.questions?.map((q, i) => {
                    const isCorrect = q.isCorrect;
                    return (
                        <div key={i} className={`border rounded-2xl overflow-hidden ${isCorrect ? "border-emerald-400/20" : "border-red-400/20"} bg-white/5`}>
                            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setOpenQ(openQ === i ? null : i)}>
                                {isCorrect ? <FaCheckCircle className="text-emerald-400 shrink-0" /> : <FaTimesCircle className="text-red-400 shrink-0" />}
                                <p className="text-white flex-1 text-sm">{q.question}</p>
                                <div className="flex gap-2 items-center">
                                    <button onClick={e => { e.stopPropagation(); toggleBookmark(i); }} className={`text-xs px-2 py-0.5 rounded border cursor-pointer transition ${bookmarks[i] ? "text-yellow-400 border-yellow-400/50" : "text-gray-500 border-gray-700 hover:text-yellow-400"}`}><FaBookmark className="inline mr-1" />{bookmarks[i] ? "Saved" : "Save"}</button>
                                    {openQ === i ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                </div>
                            </div>
                            {openQ === i && (
                                <div className="px-4 pb-4 text-sm border-t border-white/10 pt-3">
                                    <p className="text-gray-400 mb-1">Your answer: <span className={isCorrect ? "text-emerald-400" : "text-red-400"}>{q.userAnswer || "Skipped"}</span></p>
                                    {!isCorrect && <p className="text-gray-400 mb-1">Correct: <span className="text-emerald-400">{q.answer}</span></p>}
                                    {q.solution && <p className="text-gray-300 mt-2 bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3"><span className="text-cyan-400 font-semibold">Solution: </span>{q.solution}</p>}
                                    <div className="mt-3">
                                        {editingNote === i ? (
                                            <div className="flex gap-2">
                                                <textarea value={notes[i]} onChange={e => setNotes(prev => ({ ...prev, [i]: e.target.value }))} className="flex-1 bg-[#1f2937] border border-gray-600 rounded-xl p-2 text-sm text-white resize-none" rows={2} placeholder="Add a note…" />
                                                <button onClick={() => saveNote(i)} className="px-3 py-1 bg-pink-600 rounded-lg text-xs text-white cursor-pointer">Save</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setEditingNote(i)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-400 transition cursor-pointer">
                                                <FaStickyNote /> {notes[i] ? `Note: ${notes[i]}` : "Add note"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function PastChallenges({ onBack }) {
    const [view, setView] = useState("list");
    const [list, setList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        setLoading(true);
        try { const { data } = await axios.get(BASE); setList(data); } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchList(); }, []);

    const openDetail = async (id) => {
        const { data } = await axios.get(`${BASE}/${id}`);
        setSelected(data);
        setView("detail");
    };

    const deleteItem = async (id) => {
        await axios.delete(`${BASE}/${id}`);
        setList(prev => prev.filter(c => c._id !== id));
    };

    const renameItem = async (id, name) => {
        await axios.patch(`${BASE}/${id}/rename`, { name });
        setList(prev => prev.map(c => c._id === id ? { ...c, name } : c));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={view === "detail" ? () => setView("list") : onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 cursor-pointer"><FaArrowLeft /> {view === "detail" ? "Back to list" : "Back"}</button>
                {view === "list" && (
                    <>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text mb-2">Past Challenges</h1>
                        <p className="text-gray-400 text-sm mb-8">Review your challenge history, bookmarks, solutions, and notes.</p>
                        <ListView list={list} loading={loading} onOpen={openDetail} onDelete={deleteItem} onRename={renameItem} />
                    </>
                )}
                {view === "detail" && selected && <DetailView challenge={selected} onBack={() => setView("list")} />}
            </div>
        </div>
    );
}
