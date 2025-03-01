import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "./music.css"; // ✅ Import your styles

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email);
  const passwordCriteria = validatePassword(userData.password);
  const isPasswordValid =Object.values(passwordCriteria).every(Boolean); 
  const isFormValid = isEmailValid && isPasswordValid;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)) {
      toast.error("Please enter a valid email.", { autoClose: 3000 });
      return;
    }
  
    const password = userData.password;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error("Password must meet the criteria.", { autoClose: 3000 });
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
        toast.success("Registration successful! Redirecting...", { autoClose: 3000 });
        localStorage.setItem("userEmail", userData.email);
        setTimeout(() => navigate("/otp"), 2000);
      } else {
        toast.error(`${data.error || "Registration failed."}`, { autoClose: 3000 });
      }
    } catch (err) {
      toast.error("Server error. Please try again.", { autoClose: 3000 });
    }
  };
  

  return (
    <div className="register-page">
      <ToastContainer />

      <div className="register-container">
        <h2>Register</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleInputChange}
        />

        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={userData.password}
            onChange={handleInputChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className="password-input"
          />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

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

        <button onClick={handleRegister} disabled={!isFormValid}>Register</button>

        <p>Already registered? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
};

export default Register;
