import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import _ from "lodash";
import { useAuth } from "../AuthContext";
import "./music.css";
import loadingGif from "../images/loading.gif";

const backendUrl = "http://localhost:5001";

const Login = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false); // New state
  const navigate = useNavigate();
  const { login } = useAuth();
  const debounceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCaptcha = (value) => {
    setCaptchaVerified(!!value);
  };

  const handleLogin = useCallback(async () => {
    if (!userData.email || !userData.password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setSubmitted(true); // Disable button after submission

    // Check if the entered credentials match the admin credentials (from .env)
    if (
      userData.email === process.env.REACT_APP_ADMIN_EMAIL &&
      userData.password === process.env.REACT_APP_ADMIN_PASSWORD
    ) {
      // Construct the admin user object with an admin role
      const adminUser = { email: userData.email, role: "admin" };
      // Use the AuthContext login function to store the token and user data.
      // "admin-token" is a placeholder token for admin users.
      login("admin-token", adminUser);
      toast.success(
        "Admin login successful! Redirecting to admin dashboard..."
      );
      setTimeout(() => navigate("/admin-dashboard"), 2000);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      if (data.requires2FA) {
        navigate("/verify", { state: { email: userData.email } });
      } else {
        login(data.token);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 2000);
      }
    } catch (err) {
      toast.error(err.message || "Server error. Please try again.");
      setSubmitted(false); // Re-enable button on failure
    } finally {
      setLoading(false);
    }
  }, [userData, navigate, login]);

  useEffect(() => {
    debounceRef.current = _.debounce(handleLogin, 500);
  }, [handleLogin]);

  return (
    <div className="otp-page">
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      ) : (
        <div className="login">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            disabled={submitted}
          />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              className="password-input"
              placeholder="Password"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              disabled={submitted}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🔓" : "🔒"}
            </span>
          </div>
          <div className="captcha-container">
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleCaptcha}
            />
          </div>
          <button
            onClick={() => debounceRef.current()}
            disabled={!captchaVerified || submitted}
          >
            {submitted ? "Logging in..." : "Login"}
          </button>
          <p>
            No account? <Link to="/register">Register here</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
