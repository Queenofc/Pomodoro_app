import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import loadingGif from "../images/loading.gif";

const backendUrl = "http://localhost:5001";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${backendUrl}/admin/users`, {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUsers(data.users);
      } catch (error) {
        toast.error("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const approveUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/admin/approve-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success("User approved!");
      setUsers(users.map(user => user._id === userId ? { ...user, admin_approved: true } : user));
    } catch (error) {
      toast.error("Error approving user.");
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/admin/delete-user`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success("User deleted!");
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      toast.error("Error deleting user.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src={loadingGif} alt="Loading..." className="loading-gif" />
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.email} - {user.admin_approved ? "Approved" : "Pending"}
            {!user.admin_approved && (
              <button onClick={() => approveUser(user._id)}>Approve</button>
            )}
            <button onClick={() => deleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
