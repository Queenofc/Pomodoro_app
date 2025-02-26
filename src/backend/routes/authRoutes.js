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

    // Redirect to 2FA page after login
    res.json({ success: true, requires2FA: true, email });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Reset 2FA secret on logout (Forces a new QR on next login)
    user.twoFASecret = null;
    await user.save();

    res.json({ success: true, message: "Logged out. 2FA reset for next login." });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
