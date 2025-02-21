import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./music.css"; // ✅ Import styles

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = () => {
    localStorage.setItem("userEmail", userData.email);
    navigate("/otp"); // Redirect to OTP verification
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <input type="email" placeholder="Email" onChange={(e) => setUserData({ ...userData, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setUserData({ ...userData, password: e.target.value })} />
      <button onClick={handleRegister}>Register</button>
      <p>Already registered? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
