import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js"; 
import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import OtpVerification from "./components/OtpVerification.js";
import Verify2FA from "./components/Verify2FA.js";
import AdminDashboard from "./components/AdminDashboard.js";
import Wait from "./components/Wait.js";
import AdminRoute from "./components/AdminRoute.js"; // Adjust the path if needed

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpVerification />} />
      <Route 
        path="/verify" 
        element={
          <AdminRoute>
            <Verify2FA />
          </AdminRoute>
        }
      />
      <Route 
        path="/home" 
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/wait" element={<Wait />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
