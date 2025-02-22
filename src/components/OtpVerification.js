import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./music.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleOtpSubmit = () => {
    if (otp === "123456") {
      navigate("/login"); // Redirect to login after successful OTP entry
    } else {
      alert("Incorrect OTP. Try again.");
    }
  };

  return (
    <div className="otp-container">
      <h2>OTP Verification</h2>
      <p>Enter the OTP sent to your registered email or phone.</p>
      <input
        type="text"
        placeholder="Enter OTP"
        className="otp-input"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button className="otp-button" onClick={handleOtpSubmit}>
        Verify OTP
      </button>
    </div>
  );
};

export default OtpVerification;
