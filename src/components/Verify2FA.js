import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "./music.css";
import loadingGif from "../images/loading.gif";

const Verify2FA = () => {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const fetchQRCode = async () => {
      try {
        const res = await axios.post("http://localhost:5000/2fa/generate-qr", { email });
        if (res.data.qrCode) {
          setQrCode(res.data.qrCode);
        } else {
          setIs2FAEnabled(true);
        }
      } catch (err) {
        console.error("Error fetching QR Code:", err);
        toast.error("Failed to fetch QR Code. Try again.");
      } finally {
        setTimeout(() => setLoading(false), 2000); // Delay before showing the page
      }
    };

    fetchQRCode();
  }, [email, navigate]);

  const handleVerify = async () => {
    if (!email || !code) {
      toast.error("Please enter OTP.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/2fa/verify-2fa", { email, code });

      if (res.data.success) {
        login(res.data.token);
        toast.success("OTP Verified. Logging in...");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (err) {
      toast.error("Wrong OTP. Please try again.");
    }
  };

  return (
    <div className="verifypage">
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      ) : (
        <div className="otp-container">
          <h2>Enter OTP</h2>
          
          {is2FAEnabled ? (
            <div className="qr-placeholder">2FA Enabled</div>
          ) : qrCode ? (
            <img src={qrCode} alt="QR Code" className="qr-code" />
          ) : (
            <p>QR Code not available</p>
          )}

          <h1>Use Google Authenticator to scan the QR code (only for first-time users) and enter the OTP.</h1>

          <input
            type="text"
            placeholder="Enter OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="otp-input"
            maxLength="6"
          />
          <button onClick={handleVerify} className="otp-button">
            Verify & Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Verify2FA;
