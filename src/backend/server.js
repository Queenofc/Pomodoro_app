require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Fix for node-fetch ES module issue
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

// Function to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Register & Send OTP
app.post("/register", async (req, res) => { 
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & Password required" });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  try {
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ error: "User already exists. Please login." });

    // Temporarily store OTP for verification
    user = new User({ email, password, otp, otpExpiresAt: otpExpiry });
    await user.save();

    // Send OTP via Brevo
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      }),
    });

    if (response.ok) {
      res.json({ success: true, message: "OTP sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ✅ Verify OTP & Complete Registration
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email & OTP required" });

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.otp === otp && new Date(user.otpExpiresAt) > new Date()) {
      user.otp = null; // Clear OTP after verification
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

app.listen(5000, () => console.log("Server running on port 5000"));
