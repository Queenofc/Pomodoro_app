import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./music.css";

const Login = () => {
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
    if (!email.includes("@") || password.length < 6) {
      setError("Invalid email or password");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("auth", "true"); // ✅ Mark user as logged in
        navigate("/"); // ✅ Redirect to Home
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
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
