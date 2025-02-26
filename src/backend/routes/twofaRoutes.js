const express = require("express");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Generate QR Code for 2FA (Enforced at Every Login)
router.post("/generate-qr", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🚨 Always generate a new secret (Forces fresh QR on every login)
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = `otpauth://totp/ChillWithPomodoro?secret=${secret.base32}&issuer=ChillWithPomodoro`;

    console.log("Generated Secret:", secret.base32); // Debugging
    console.log("OTP Auth URL:", otpauthUrl); // Debugging

    const qrCode = await qrcode.toDataURL(otpauthUrl);

    // Store secret temporarily
    user.twoFASecret = secret.base32;
    await user.save();

    res.json({ success: true, qrCode, message: "Scan this QR code to enable 2FA" });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});
router.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.twoFASecret) return res.status(400).json({ error: "2FA not set up for this user" });

    // ✅ Verify OTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid 2FA code" });

    // ✅ Generate JWT token after successful 2FA
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;