import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./music.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = async () => {
    const email = localStorage.getItem("userEmail");
  
    if (!email) {
      toast.error("No email found. Please register again.", { autoClose: 3000 });
      return;
    }
  
    if (otp.length !== 6) {
      toast.error("OTP must be exactly 6 digits.", { autoClose: 3000 });
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
  
      const data = await response.json();
      console.log(data); // Debugging: Check the response structure
  
      if (data?.success) {
        toast.success("OTP verified successfully!", { autoClose: 3000 });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data?.error ?? "OTP verification failed.", { autoClose: 3000 });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Server error. Please try again.", { autoClose: 3000 });
    }
  };
  
  return (
    <div className="otp-page">
      <ToastContainer />
      <div className="otp-container">
        <h2>OTP Verification</h2>
        <p>Enter the OTP sent to your registered email.</p>
        <input
          type="text"
          placeholder="Enter OTP"
          className="otp-input"
          value={otp}
          onChange={handleOtpChange}
          maxLength={6}
        />
        <button className="otp-button" onClick={handleOtpSubmit} disabled={otp.length !== 6}>
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
