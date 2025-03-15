import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.js";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && !user.isAdmin) {
    return <Navigate to="/verify" />;
  }

  if (user && user.requires2FA && !user.is2FAVerified && location.pathname !== "/verify") {
    return <Navigate to="/verify" />;
  }

  return children;
};

export default AdminRoute;
