import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Set axios default header whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token]);

    // Fetch me on load if token exists
    useEffect(() => {
        const fetchMe = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get("http://localhost:5000/api/auth/me");
                setUser(res.data);
            } catch (err) {
                console.error("Auth fetch error:", err);
                logout(); // token invalid/expired
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
