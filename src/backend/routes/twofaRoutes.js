const express = require("express");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Generate QR Code for 2FA
router.post("/generate-qr", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.twoFAEnabled) {
      return res.json({ success: true, message: "2FA already enabled" });
    }

    // Generate secret and QR code
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = `otpauth://totp/MyApp?secret=${secret.base32}&issuer=MyApp`;
    const qrCode = await qrcode.toDataURL(otpauthUrl);

    // Save secret in database
    user.twoFASecret = secret.base32;
    user.twoFAEnabled = true;
    await user.save();

    res.json({ success: true, qrCode, message: "Scan this QR code to enable 2FA" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Verify 2FA OTP and Reset 2FA
router.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.twoFASecret) return res.status(400).json({ error: "2FA not set up for this user" });

    // Verify OTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid 2FA code" });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Reset 2FA after verification
    user.twoFAEnabled = false;
    user.twoFASecret = null;
    await user.save();

    res.json({ success: true, token, message: "Login successful, 2FA reset" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
