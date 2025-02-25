import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./music.css";

const Login = ({ onLogin }) => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleCaptcha = (value) => {
    setCaptchaVerified(!!value);
  };

  const handleLogin = async () => {
    const { email, password } = userData;

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🔄 Login Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Check if 2FA is required
      if (data.requires2FA) {
        console.log("🔑 2FA Required. Redirecting to verification...");
        navigate("/verify", { state: { email } });
      } else {
        console.log("✅ Logged in successfully!");
        localStorage.setItem("auth", "true"); // Store authentication status
        localStorage.setItem("token", data.token); // Store JWT token
        onLogin(); // Update authentication state in App.js
        navigate("/home"); // Redirect to home
      }
    } catch (err) {
      console.error("❌ Login Error:", err.message);
      setError(err.message || "Server error. Please try again.");
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={userData.email}
        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
      />
      <div className="password-container">
        <input
          type={showPassword ? "text" : "password"}
          className="password-input"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="captcha-container">
        <ReCAPTCHA sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} onChange={handleCaptcha} />
      </div>
      <button onClick={handleLogin} disabled={!captchaVerified}>
        Login
      </button>
      <p>
        No account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
