import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import loadingGif from "../images/loading.gif";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "./music.css";

const backendUrl = "http://localhost:5001";

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
      setLoading(false);
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

  const approveUser = (userId) => {
    handleUserAction("/admin/approve-user", userId, "User approved!");
  };

  const deleteUser = (userId) => {
    handleUserAction("/admin/delete-user", userId, "User deleted!");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src={loadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ToastContainer />
      <h2>Admin Dashboard</h2>
      <p>Welcome, {adminEmail}. You have admin access.</p>
      <div className="user-sections">
        <div className="approve-users">
          <h3>Approve Users</h3>
          <ul>
            {users.filter((u) => !u.admin_approved).map((u) => (
              <li key={u._id}>
                {u.email} - Pending
                <button onClick={() => approveUser(u._id)}>Approve</button>
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
                <button onClick={() => deleteUser(u._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
