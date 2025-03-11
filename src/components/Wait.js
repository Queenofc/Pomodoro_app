import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./music.css"; // Ensure this file includes the above CSS
import loadingGif from "../images/loading.gif";

const Wait = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <img src={loadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <div className="wait-page">
      <h2>Approval Status</h2>
      <p>
        Your account is awaiting admin approval. If approved, you will be
        redirected to the verify page. Please check back after some time.
      </p>
      <p>
        <Link to="/login">⬅ Back to Login</Link>
      </p>
    </div>
  );
};

export default Wait;
