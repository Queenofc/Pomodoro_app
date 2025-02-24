const express = require("express");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const jwt = require('jsonwebtoken');

const router = express.Router();

// 🟢 Send OTP via Brevo
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(email, "Hello! Welcome to Chill with Pomodoro. ", `<h2>Your OTP: ${otp}</h2>`);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// 🟢 Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Input validation
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Clear the OTP and its expiration time
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Mark the user's email as verified
    user.isEmailVerified = true;
    await user.save();

    // Generate a JWT token for authenticated access
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Respond with success and token
    res.json({ success: true, message: "OTP verified", token });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
