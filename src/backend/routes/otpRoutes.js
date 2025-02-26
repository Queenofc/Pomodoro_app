const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register & Send OTP
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || password.length < 6)
    return res.status(400).json({ error: "Invalid email or password format" });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists. Please login." });

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user = new User({ email, password: hashedPassword, otp, otpExpiresAt: otpExpiry });
    await user.save();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": API_KEY },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL },
        to: [{ email }],
        subject: "OTP for Registeration",
        htmlContent: `<p>Welcome to Chill With Pomodoro! Your OTP for registration is: <strong>${otp}</strong></p>`,
      }),
    });

    if (response.ok) res.json({ success: true, message: "OTP sent successfully" });
    else res.status(500).json({ error: "Failed to send OTP" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !/^\d{6}$/.test(otp))
    return res.status(400).json({ error: "Invalid email or OTP format" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.otp === otp && new Date(user.otpExpiresAt) > new Date()) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      res.json({ success: true, message: "OTP verified. Registration complete." });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
