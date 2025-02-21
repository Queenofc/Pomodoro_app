import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./music.css";

const Login = () => {
  const [captchaVerified, setCaptchaVerified] = useState(true);
  const navigate = useNavigate();

  const handleCaptcha = (value) => {
    setCaptchaVerified(!!value); // Captcha must be filled
  };

  const handleLogin = () => {
    if (captchaVerified) {
      localStorage.setItem("auth", "true"); // Store authentication state
      navigate("/");
    } else {
      alert("Please verify CAPTCHA before logging in.");
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <div className="captcha-container">
        <ReCAPTCHA sitekey="YOUR_RECAPTCHA_SITE_KEY" onChange={handleCaptcha} />
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
