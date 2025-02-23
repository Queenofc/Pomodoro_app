require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const User = require("./models/User");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => password.length >= 6;

// Register & Send OTP
app.post("/register", async (req, res) => { 
  const { email, password } = req.body;
  if (!isValidEmail(email) || !isValidPassword(password)) 
    return res.status(400).json({ error: "Invalid email or password format" });

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists. Please login." });

    user = new User({ email, password, otp, otpExpiresAt: otpExpiry });
    await user.save();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": API_KEY },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL },
        to: [{ email }],
        subject: "OTP Verification ",
        htmlContent: `<p> Hello! Welcome to Chill with pomodoro . Your OTP is : <strong>${otp}</strong> </p>`,
      }),
    });

    if (response.ok) res.json({ success: true, message: "OTP sent successfully" });
    else res.status(500).json({ error: "Failed to send OTP" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ✅ Verify OTP & Complete Registration
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // ✅ 1. Validate input fields
  if (!email || !otp) {
    return res.status(400).json({ error: "Email & OTP required" });
  }

  // ✅ 2. Ensure OTP is exactly 6 digits and numeric
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: "Invalid OTP format. OTP must be a 6-digit number." });
  }

  try {
    const user = await User.findOne({ email });

    // ✅ 3. Check if user exists
    if (!user) return res.status(400).json({ error: "User not found" });

    // ✅ 4. Verify OTP and check expiry
    if (user.otp === otp && new Date(user.otpExpiresAt) > new Date()) {
      // ✅ 5. Clear OTP after successful verification
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      
      return res.json({ success: true, message: "OTP verified. Registration complete." });
    } else {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});


// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!isValidEmail(email) || !isValidPassword(password))
    return res.status(400).json({ error: "Invalid email or password format" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.password !== password) return res.status(400).json({ error: "Incorrect password" });

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Enable Google Authenticator 2FA
app.post("/enable-2fa", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const secret = speakeasy.generateSecret({ name: `Pomodoro App (${email})` });
    user.twoFASecret = secret.base32;
    user.twoFAEnabled = true;
    await user.save();

    QRCode.toDataURL(secret.otpauth_url, (err, qrCode) => {
      if (err) return res.status(500).json({ error: "QR code generation failed" });
      res.json({ success: true, qrCode, secret: secret.base32 });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Verify Google Authenticator OTP
app.post("/verify-2fa", async (req, res) => {
  const { email, token } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.twoFASecret) return res.status(400).json({ error: "2FA not enabled" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (verified) res.json({ success: true, message: "2FA verification successful" });
    else res.status(400).json({ error: "Invalid OTP" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
