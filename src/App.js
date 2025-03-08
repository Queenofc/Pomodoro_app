import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js"; 
import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register,js";
import OtpVerification from "./components/OtpVerification.js";
import Verify2FA from "./components/Verify2FA,js";

const App = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<OtpVerification />} />
            <Route path="/verify" element={<Verify2FA />} />
            <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            {/* Redirect any undefined route (including "/") to "/login" */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default App;
