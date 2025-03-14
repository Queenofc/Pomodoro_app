const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Middleware to check if user is an admin
const checkAdmin = async (req, res, next) => {
  const { email } = req.body; // Extract user email from request body

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Error checking admin status" });
  }
};

// Get all users (Admin only)
router.post("/users", checkAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "email admin_approved");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Approve a user (Admin only)
router.post("/approve-user", checkAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { admin_approved: true }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error approving user" });
  }
});

// Delete a user (Admin only)
router.post("/delete-user", checkAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
