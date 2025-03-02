import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "./music.css";
import loadingGif from "../images/loading.gif";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      setTimeout(() => setLoading(false), 2000); // 2 seconds delay before showing the page
    }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No email found. Please register again.");
    }
  }, []);

  const handleOtpChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp) {
      toast.warn("Please enter the OTP.");
      return;
    }
    if (otp.length !== 6) {
      toast.warn("OTP must be 6 digits long.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        toast.success("OTP verified successfully!", { autoClose: 2000 });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(data?.error || "OTP verification failed.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

  return (
    <div className="otp-page">
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      ) : (
        <div className="otp-container">
          <h2>OTP Verification</h2>
          <p>
            Enter the OTP sent to your registered email. Make sure there are no
            white spaces in between the digits.
          </p>
          <input
            type="text"
            placeholder="Enter OTP"
            className="otp-input"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            disabled={loading} // Prevent typing during loading
          />
          <button className="otp-button" onClick={handleOtpSubmit} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <p>
            <a href="/register">⬅ Back to Register</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;
