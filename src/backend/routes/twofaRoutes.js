const express = require("express");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Temporary storage for 2FA secrets
const tempTwoFAStorage = new Map(); // Maps email -> temp secret

// 🔹 Generate QR Code for 2FA (First-time Setup)
router.post("/generate-qr", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // If 2FA is already enabled, inform the user
    if (user.twoFASecret) {
      return res.json({ 
        success: true, 
        message: "2FA is already enabled. You don’t need to scan a QR code again." 
      });
    }

    // Generate a new secret and store it temporarily
    const secret = speakeasy.generateSecret({ length: 20 });
    tempTwoFAStorage.set(email, secret.base32);

    // Generate OTPAuth URL and QR Code
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(user.email + ': ChillWithPomodoro')}?secret=${secret.base32}`;
    const qrCode = await qrcode.toDataURL(otpauthUrl);

    res.json({ success: true, qrCode, message: "Scan this QR code to enable 2FA" });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// 🔹 Verify 2FA OTP and Enable 2FA
router.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    let secret;

    // ✅ If 2FA is already set up, use the stored secret
    if (user.twoFASecret) {
      secret = user.twoFASecret;
    } else {
      // ✅ If first-time setup, use the temporary secret
      secret = tempTwoFAStorage.get(email);
      if (!secret) {
        return res.status(400).json({ error: "No pending 2FA setup found. Generate a QR code first." });
      }
    }

    // ✅ Verify OTP
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1, // Allow slight clock drift
    });

    if (!verified) return res.status(400).json({ error: "Invalid 2FA code" });

    // ✅ If first-time setup, save secret permanently
    if (!user.twoFASecret) {
      user.twoFASecret = secret;
      await user.save();
      tempTwoFAStorage.delete(email); // Remove temporary secret
    }

    // ✅ Generate JWT token after successful 2FA
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, message: "2FA successfully verified. Login successful." });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
