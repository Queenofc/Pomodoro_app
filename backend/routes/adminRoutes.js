const express = require("express");
const User = require("../models/User");

const router = express.Router();


router.post("/users", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    const adminUser = await User.findOne({ email });
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const users = await User.find({ isAdmin: false }, "email admin_approved");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


router.post("/approve-user", async (req, res) => {
  const { email, userId } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    const adminUser = await User.findOne({ email });
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { admin_approved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User approved successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error approving user" });
  }
});


router.post("/delete-user", async (req, res) => {
  const { email, userId } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    const adminUser = await User.findOne({ email });
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
