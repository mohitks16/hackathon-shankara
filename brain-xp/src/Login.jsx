import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Mail, Lock, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSampleLogin = () => {
        setFormData({
            email: 'test@example.com',
            password: 'password123'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg mb-4"
                    >
                        <UserCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 mt-2">Log in to continue your learning journey.</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white placeholder-slate-500 transition-all outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                                    <label className="block text-sm font-medium text-slate-300">Password</label>
                                    <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white placeholder-slate-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 
                                ${loading
                                    ? 'bg-blue-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25'
                                } transition-all duration-200`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 flex flex-col gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1e293b] text-slate-400">Or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSampleLogin}
                            className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl text-slate-300 transition-colors flex items-center justify-center text-sm font-medium"
                        >
                            Use Sample Credentials
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign up here
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
