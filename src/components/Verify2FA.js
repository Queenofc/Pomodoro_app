import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Verify2FA = () => {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  useEffect(() => {
    console.log("📨 Sending request to fetch QR Code for:", email);
    
    if (!email) {
      console.error("❌ No email found, redirecting...");
      navigate("/login");
      return;
    }
  
    axios.post("http://localhost:5000/2fa/generate-qr", { email })
      .then((res) => {
        console.log("✅ QR Code Response:", res.data);
        if (res.data.qrCode) {
          setQrCode(res.data.qrCode);
        } else {
          console.error("❌ QR Code not received from backend!");
        }
      })
      .catch((err) => console.error("❌ Error fetching QR Code:", err))
      .finally(() => setLoading(false));
  }, [email, navigate]);
  

  const handleVerify = async () => {
    console.log("🟢 handleVerify called!");
  
    if (!email || !code) {
      console.error("❌ Missing email or OTP.");
      alert("Please enter OTP.");
      return;
    }
  
    console.log("📨 Sending verification request for:", email, "with code:", code);
  
    try {
      const res = await axios.post("http://localhost:5000/2fa/verify-2fa", { email, code });
  
      console.log("✅ Server Response:", res.data);
  
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        alert(res.data.message);
        navigate("/home");
      } else {
        console.error("❌ OTP verification failed.");
        alert("Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      alert("Error verifying OTP. Check console.");
    }
  };
  
  return (
    <div>
      <h2>Scan and Enter OTP</h2>
      {loading ? <p>Loading QR Code...</p> : qrCode ? <img src={qrCode} alt="QR Code" /> : <p>QR Code not available</p>}
      <input type="text" placeholder="Enter OTP" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleVerify}>Verify & Login</button>
    </div>
  );
};

export default Verify2FA;
