import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
