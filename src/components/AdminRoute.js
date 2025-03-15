import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.js";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Not logged in? Send to login page.
    return <Navigate to="/login" />;
  }

  // If the user is an admin, redirect to the admin dashboard
  if (user && user.isAdmin && location.pathname !== "/admin-dashboard") {
    return <Navigate to="/admin-dashboard" />;
  }

  // For non-admin users:
  if (user && !user.isAdmin) {
    // If not approved by admin, redirect to the wait page
    if (!user.admin_approved && location.pathname !== "/wait") {
      return <Navigate to="/wait" />;
    }
    // If approved, redirect to the verify page
    if (user.admin_approved && location.pathname !== "/verify") {
      return <Navigate to="/verify" />;
    }
  }

  // Otherwise, render the protected children
  return children;
};

export default AdminRoute;
