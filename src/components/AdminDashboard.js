import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import loadingGif from "../images/loading.gif";
import { useAuth } from "../AuthContext.js";
import { useNavigate } from "react-router-dom";
import "./music.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Simple debounce implementation.
function debounce(func, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const adminEmail = user?.email;
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    if (!adminEmail) {
      toast.error("No admin user found. Please log in as admin.");
      setLoading(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000); // 2-second delay added here
    }
  }, [adminEmail, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (url, userId, successMessage) => {
    try {
      const response = await fetch(`${backendUrl}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: adminEmail, userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await fetchUsers();
      toast.success(data.message || successMessage);
    } catch (error) {
      console.error("Error performing action on user:", error);
      toast.error("Error processing request.");
    }
  };

  // Create debounced functions using useRef so they are created once.
  const debouncedApproveUser = useRef(
    debounce((userId) => {
      handleUserAction("/admin/approve-user", userId, "User approved!");
    }, 500)
  ).current;

  const debouncedDeleteUser = useRef(
    debounce((userId) => {
      handleUserAction("/admin/delete-user", userId, "User deleted!");
    }, 500)
  ).current;

  return (
    <div className="admin-page">
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      ) : (
        <div className="admin">
          <h2>Admin Dashboard</h2>
          <p>Welcome, {adminEmail}. You have admin access.</p>
          <div className="user-sections">
            <div className="approve-users">
              <h3>Approve Users</h3>
              <ul>
                {users
                  .filter((u) => !u.admin_approved)
                  .map((u) => (
                    <li key={u._id}>
                      {u.email} - Pending
                      <button onClick={() => debouncedApproveUser(u._id)}>
                        Approve
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="delete-users">
              <h3>Delete Users</h3>
              <ul>
                {users.map((u) => (
                  <li key={u._id}>
                    {u.email} - {u.admin_approved ? "Approved" : "Pending"}
                    <button onClick={() => debouncedDeleteUser(u._id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
