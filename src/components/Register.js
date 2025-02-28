import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./music.css"; // ✅ Import your styles

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // ✅ Track focus state
  const navigate = useNavigate();

  // ✅ Password validation logic (updates on input change)
  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordCriteria = validatePassword(userData.password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // ✅ Handle input change dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!userData.email.includes("@") || !userData.email.includes(".")) {
      setError("❌ Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("❌ Password does not meet the required criteria.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/otp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userEmail", userData.email);
        navigate("/otp");
      } else {
        setError(data.error || "❌ Registration failed.");
      }
    } catch (err) {
      setError("❌ Server error. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleInputChange}
      />

      {/* ✅ Password Input + Eye Toggle */}
      <div className="password-container">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleInputChange}
          onFocus={() => setIsPasswordFocused(true)}  // ✅ Show validation when focused
          onBlur={() => setIsPasswordFocused(false)}  // ✅ Hide validation when unfocused
          className="password-input"
        />
        <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>

      {/* ✅ Password Strength Indicators (Appears only when input is focused) */}
      {isPasswordFocused && (
        <div className="password-validation">
          <p className={passwordCriteria.length ? "valid" : "invalid"}>
            <span>{passwordCriteria.length ? "✅" : "❌"}</span> 8+ characters
          </p>
          <p className={passwordCriteria.uppercase ? "valid" : "invalid"}>
            <span>{passwordCriteria.uppercase ? "✅" : "❌"}</span> 1 uppercase
          </p>
          <p className={passwordCriteria.lowercase ? "valid" : "invalid"}>
            <span>{passwordCriteria.lowercase ? "✅" : "❌"}</span> 1 lowercase
          </p>
          <p className={passwordCriteria.number ? "valid" : "invalid"}>
            <span>{passwordCriteria.number ? "✅" : "❌"}</span> 1 number
          </p>
          <p className={passwordCriteria.specialChar ? "valid" : "invalid"}>
            <span>{passwordCriteria.specialChar ? "✅" : "❌"}</span> 1 special character
          </p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      <button onClick={handleRegister} disabled={!isPasswordValid}>Register</button>

      <p>Already registered? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
