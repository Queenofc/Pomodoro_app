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

  // Validate email format
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate password using the function
  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordValidation = validatePassword(password);

  if (!Object.values(passwordValidation).every(Boolean)) {
    return res.status(400).json({ 
      error: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      details: passwordValidation 
    });
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
        subject: "Registration for Chill With Pomodoro",
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
  try {
    const { email, otp } = req.body;

    // Check if OTP exists in the store
    const tempData = otpStore.get(email);
    if (!tempData || !tempData.otp) {
      return res.status(400).json({ error: "No OTP found. Please login again." });
    }

    // Ensure OTP is not empty
    if (!tempData.otp || tempData.otp.trim() === "") {
      return res.status(400).json({ error: "OTP is required" });
    }

    // Validate OTP format and length
    if (!/^\d+$/.test(tempData.otp) || tempData.otp.length !== 6) {
      return res.status(400).json({ error: "Invalid OTP format. OTP must be exactly 6 digits and contain only numbers." });
    }

    // Compare OTP
    if (tempData.otp !== otp) {
      return res.status(400).json({ error: "Incorrect OTP . Please login once again." });
    }

    if (new Date(tempData.otpExpiresAt) < new Date()) {
      return res.status(400).json({ error: "OTP has expired. Please login again." });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email: tempData.userData.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered. Please log in instead." });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(tempData.userData.password, 10);

    const newUser = new User({
      email: tempData.userData.email,
      password: hashedPassword,
    });

    await newUser.save();
    otpStore.delete(email);

    res.json({ success: true, message: "OTP verified. Registration complete." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

module.exports = router;
