import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./music.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      const email = localStorage.getItem("userEmail");

      if (!email) {
        throw new Error("No email found. Please register again.");
      }

      if (!/^\d{6}$/.test(otp)) {
        throw new Error("Invalid OTP! Enter exactly 6 numeric digits.");
      }

      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data?.success) {
        toast.success("OTP verified successfully!", { autoClose: 3000 });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(data?.error ?? "OTP verification failed.");
      }
    } catch (err) {
      console.error("Error:", err.message);
      toast.error(err.message, { autoClose: 3000 });
    }
  };

  return (
    <div className="otp-page">
      <ToastContainer />
      <div className="otp-container">
        <h2>OTP Verification</h2>
        <p>Enter the OTP sent to your registered email. Make sure there are no white spaces in between the digits.</p>
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
