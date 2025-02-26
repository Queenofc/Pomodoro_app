import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Verify2FA = () => {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
  
    axios.post("http://localhost:5000/2fa/generate-qr", { email })
      .then((res) => {
        if (res.data.qrCode) {
          setQrCode(res.data.qrCode);
        } else {
          console.error("❌ QR Code not received from backend!");
        }
      })
      .catch((err) => console.error("❌ Error fetching QR Code:", err))
      .finally(() => setLoading(false));
  }, [email, navigate,location.state]);
  

  const handleVerify = async () => {  
    if (!email || !code) {
      alert("Please enter OTP.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/2fa/verify-2fa", { email, code });
  
      if (res.data.success) {
        login(res.data.token);
        alert(res.data.message);
        navigate("/home");
      } else {
        alert("Invalid OTP. Try again.");
      }
    } catch (err) {
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
