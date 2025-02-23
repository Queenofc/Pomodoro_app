import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import OtpVerification from "./components/OtpVerification";

const App = () => {
  const isAuthenticated = localStorage.getItem("auth") === "true"; // Check login status

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OtpVerification />} />
      <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
