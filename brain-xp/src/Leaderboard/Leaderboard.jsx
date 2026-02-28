import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Medal, Star, ChevronLeft, Award } from 'lucide-react';
import { getLevelFromXP } from '../levelUtils';

const API_BASE_URL = "http://localhost:5000/api";

const Leaderboard = ({ onBack }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/stats/leaderboard`);
                setLeaders(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return "from-yellow-400 to-yellow-600 border-yellow-500/50 shadow-yellow-500/20";
            case 1: return "from-slate-300 to-slate-500 border-slate-400/50 shadow-slate-400/20";
            case 2: return "from-amber-600 to-orange-800 border-orange-700/50 shadow-orange-700/20";
            default: return "from-slate-800 to-slate-900 border-slate-700/30";
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="w-6 h-6 text-yellow-100" />;
            case 1: return <Medal className="w-6 h-6 text-slate-100" />;
            case 2: return <Medal className="w-6 h-6 text-orange-200" />;
            default: return <span className="font-bold text-slate-500 w-6 text-center">#{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 relative z-10">
                <button
                    onClick={onBack || (() => navigate('/'))}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group bg-slate-800/50 px-4 py-2 rounded-full w-fit border border-slate-700/50"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold text-sm">Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-2xl shadow-lg border border-yellow-400/20">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-amber-500 bg-clip-text text-transparent">
                            Global Leaderboard
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Top players ranked by total XP and Level</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto relative z-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center text-slate-400 backdrop-blur-sm">
                        No players found yet. Start learning to claim the #1 spot!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaders.map((user, idx) => {
                            const levelInfo = getLevelFromXP(user.totalXP);
                            return (
                                <motion.div
                                    key={user.userId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`relative flex items-center justify-between p-4 md:p-5 rounded-2xl border bg-gradient-to-r ${getRankStyle(idx)} backdrop-blur-md transition-all hover:scale-[1.01]`}
                                >
                                    <div className="flex items-center gap-4 md:gap-6 w-full">
                                        {/* Rank */}
                                        <div className="flex items-center justify-center w-8 md:w-12 shrink-0">
                                            {getRankIcon(idx)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex flex-col flex-grow truncate">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg md:text-xl truncate">{user.username}</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider bg-black/20 text-white/90 shrink-0">
                                                    Lvl {levelInfo.level}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-white/60 flex items-center gap-1">
                                                    <span>{levelInfo.bracketIcon}</span> {levelInfo.bracket}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badges Preview */}
                                        <div className="hidden md:flex items-center gap-1.5 shrink-0 px-4">
                                            {user.badges?.slice(0, 4).map((b, i) => (
                                                <div key={i} className="bg-black/20 p-1.5 rounded" title={b.badgeName}>
                                                    <span className="text-sm">
                                                        {b.category === 'practice' ? '⚔️' : b.category === 'streak' ? '🔥' : b.category === 'learning' ? '📚' : '🎯'}
                                                    </span>
                                                </div>
                                            ))}
                                            {user.badges?.length > 4 && (
                                                <span className="text-xs text-white/50 ml-1">+{user.badges.length - 4}</span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 shrink-0 justify-end md:w-48">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                                    <span className="font-bold text-lg">{user.totalXP.toLocaleString()}</span>
                                                </div>
                                                <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Total XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
