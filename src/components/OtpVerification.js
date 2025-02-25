import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState(""); // Store user's email
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve email from localStorage (or sessionStorage, Redux, etc.)
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No email found. Please register again.");
    }
  }, []);

  const handleOtpChange = (e) => {
    const value = e.target.value;

    // Allow only numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setError(""); // Clear error when valid input is entered
    } else {
      setError("OTP must be a 6-digit number.");
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }), // Use actual email
      });

      const data = await response.json();

      if (data.success) {
        navigate("/login"); // Redirect after success
      } else {
        setError(data.error || "OTP verification failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      <h2>OTP Verification</h2>
      <p>Enter the OTP sent to your registered email: <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="Enter OTP"
        className="otp-input"
        value={otp}
        onChange={handleOtpChange}
      />
      {error && <p className="error-message">{error}</p>}
      <button className="otp-button" onClick={handleOtpSubmit} disabled={otp.length !== 6}>
        Verify OTP
      </button>
    </div>
  );
};

export default OtpVerification;
