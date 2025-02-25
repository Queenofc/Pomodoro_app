import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import OtpVerification from "./components/OtpVerification";
import Verify2FA from "./components/Verify2FA";

const App = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem("auth") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  // Function to handle login
  const handleLogin = () => {
    localStorage.setItem("auth", "true");
    setIsAuthenticated(true);
    navigate("/home");  // Redirect after login
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpVerification />} />
      <Route path="/verify" element={<Verify2FA onLogin={handleLogin} />} />
      <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
