const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmailOTP } = require("../utils/emailService");

require("dotenv").config();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiration time (10 minutes from now)
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    // Save the user to the database
    await newUser.save();

    // Send the OTP to the user's email
    await sendEmailOTP(email, otp);

    // Respond with success message
    res.json({ success: true, requiresOTP: true, message: "OTP sent for verification" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Check if 2FA is enabled for the user
    if (user.twoFAEnabled) {
      return res.json({ success: true, requires2FA: true, message: "2FA verification required" });
    }

    // If 2FA is not enabled, generate a JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});