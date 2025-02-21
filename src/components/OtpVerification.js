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
    <div>
      <h2>Enter OTP</h2>
      <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
      <button onClick={handleOtpSubmit}>Verify OTP</button>
    </div>
  );
};

export default OtpVerification;
