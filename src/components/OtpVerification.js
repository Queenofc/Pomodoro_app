import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import _ from "lodash";  // Import Lodash for debouncing
import "./music.css";
import loadingGif from "../images/loading.gif";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
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
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = useCallback(async () => {
    if (!otp) {
      toast.warn("Please enter the OTP.");
      return;
    }
    if (otp.length !== 6) {
      toast.warn("OTP must be 6 digits long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        toast.success("OTP verified successfully!", { autoClose: 2000 });
        setIsSubmitted(true); // Disable further submissions on success
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(data?.error || "OTP verification failed.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp, email, navigate]);

  // Debounce the function once on component mount
  useEffect(() => {
    debounceRef.current = _.debounce(handleOtpSubmit, 500);
  }, [handleOtpSubmit]);

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
          <p>Enter the OTP sent to your registered email.</p>
          <input
            type="text"
            placeholder="Enter OTP"
            className="otp-input"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
          />
          <button
            className="otp-button"
            onClick={() => debounceRef.current()}
            disabled={isSubmitted}  // Button is disabled only after a successful submission
          >
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
