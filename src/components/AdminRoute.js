import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.js";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // If not logged in, redirect to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If logged in but not an admin, redirect to home.
  if (user && !user.isAdmin) {
    return <Navigate to="/home" />;
  }

  // Otherwise, allow access.
  return children;
};

export default AdminRoute;
