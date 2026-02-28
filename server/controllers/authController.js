import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modal/UserModal/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

// ─── SIGNUP ────────────────────────────────────────────────────────
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, email: newUser.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error during signup" });
    }
};

// ─── LOGIN ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ id: user._id, username: user.username, email: user.email });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
