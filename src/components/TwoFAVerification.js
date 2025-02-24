import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TwoFAVerification = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userEmail = new URLSearchParams(window.location.search).get("email");

  const handleVerify2FA = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token); // Save the token
        navigate("/"); // Redirect to the dashboard or home page
      } else {
        setError(data.error || "2FA verification failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>2FA Verification</h2>
      <p>Enter the 2FA code from your authenticator app.</p>
      <input
        type="text"
        placeholder="Enter 2FA Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleVerify2FA} disabled={loading}>
        {loading ? "Verifying..." : "Verify 2FA"}
      </button>
    </div>
  );
};

export default TwoFAVerification;