import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaBell, FaClock, FaCheck, FaBook } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api/brain-reset";

const INTERVAL_META = {
    1: { label: "1-Day Review", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-400/30", icon: "🟢" },
    5: { label: "5-Day Review", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-400/30", icon: "🔵" },
    14: { label: "14-Day Review", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30", icon: "🟠" },
    30: { label: "30-Day Review", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-400/30", icon: "🟣" },
};

export default function RevisionNotifications({ onBack }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/notifications`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
        setLoading(false);
    };

    const dismissNotification = async (id) => {
        try {
            await axios.patch(`${API}/notifications/${id}/dismiss`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            console.error("Failed to dismiss:", err);
        }
    };

    // Group by interval
    const grouped = {};
    for (const n of notifications) {
        const key = n.dayInterval;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(n);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-8 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 text-amber-400 mb-3">
                        <FaBell className="text-2xl" />
                        <span className="text-sm font-bold uppercase tracking-widest">Forgetting Curve</span>
                    </div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
                        Revision Reminders
                    </h1>
                    <p className="text-gray-400 mt-3">
                        Topics that need your attention right now — revisit them to lock knowledge in permanently.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-20">
                        <div className="animate-pulse text-lg">Loading notifications...</div>
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <FaCheck className="text-5xl text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-green-400">All caught up!</h3>
                        <p className="text-gray-400 mt-2">No pending revision reminders. Keep learning!</p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {[1, 5, 14, 30].map((interval) => {
                            const items = grouped[interval];
                            if (!items || items.length === 0) return null;
                            const meta = INTERVAL_META[interval];

                            return (
                                <motion.div
                                    key={interval}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xl">{meta.icon}</span>
                                        <h2 className={`text-lg font-bold ${meta.color}`}>{meta.label}</h2>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${meta.bg} ${meta.border} border`}>
                                            {items.length}
                                        </span>
                                    </div>

                                    <div className="grid gap-3">
                                        {items.map((n) => (
                                            <motion.div
                                                key={n._id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`flex items-center justify-between ${meta.bg} ${meta.border} border rounded-xl px-5 py-4`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FaBook className={meta.color} />
                                                    <div>
                                                        <p className="font-semibold text-white">{n.topic}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                            <FaClock className="text-[10px]" />
                                                            <span>Studied {new Date(n.dueDate.getTime ? n.dueDate : n.dueDate).toLocaleDateString?.() || "recently"}</span>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="capitalize">{n.source}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => dismissNotification(n._id)}
                                                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition"
                                                >
                                                    Dismiss
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
