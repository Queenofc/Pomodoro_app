const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // If the user is an admin, indicate redirection to admin dashboard
    if (user.isAdmin) {
      return res.json({ success: true, isAdmin: true, email });
    } else {
      // Otherwise, require 2FA for non-admin users
      return res.json({ success: true, requires2FA: true, email });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "Logged out." });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
