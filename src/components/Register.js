import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./music.css"; // ✅ Keep your existing styles

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const { email, password } = userData;

    // 🔹 Simple email validation
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    // 🔹 Password validation (min 6 chars, at least 1 number or special character)
    if (password.length < 6 || !/[0-9!@#$%^&*]/.test(password)) {
      setError("Password must be at least 6 characters long and contain a number or special character.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userEmail", email); // ✅ Store only after successful registration
        navigate("/otp"); // Redirect to OTP verification
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      />
<div className="password-container">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={userData.password}
    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
    className="password-input"
  />
  <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? "👁️" : "👁️‍🗨️"}
  </span>
</div>

      {error && <p className="error-message">{error}</p>}
      <button onClick={handleRegister}>Register</button>
      <p>Already registered? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
