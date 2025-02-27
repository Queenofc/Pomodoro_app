const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStore = new Map();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email) || password.length < 6) {
    return res.status(400).json({ error: "Invalid email or password format" });
  }

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists. Please login." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "api-key": API_KEY 
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL },
        to: [{ email }],
        subject: "OTP for Registration",
        htmlContent: `<p>Welcome to Chill With Pomodoro! Your OTP for registration is: <strong>${otp}</strong></p>`,
      }),
    });

    const responseBody = await response.json();

    if (response.ok) {
      otpStore.set(email, { otp, otpExpiresAt: otpExpiry, userData: { email, password } });
      res.json({ success: true, message: "OTP sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send OTP", details: responseBody });
    }
  } catch (error) {
    res.status(500).json({ error: "Error sending OTP", details: error.message });
  }
});


router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!otp || !/\d{6}/.test(otp)) {
    return res.status(400).json({ error: "Invalid OTP format" });
  }

  try {
    const tempData = otpStore.get(email);
    if (!tempData || tempData.otp !== otp || new Date(tempData.otpExpiresAt) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(tempData.userData.password, 10);

    const newUser = new User({
      email: tempData.userData.email,
      password: hashedPassword,
      otp: tempData.otp,
      otpExpiresAt: tempData.otpExpiresAt,
    });

    await newUser.save();
    otpStore.delete(email);

    res.json({ success: true, message: "OTP verified. Registration complete." });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
