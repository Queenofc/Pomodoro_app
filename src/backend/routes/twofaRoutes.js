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

    // If a secret already exists, inform the user but do not send the QR code
    if (user.twoFASecret) {
      return res.json({ 
        success: true, 
        message: "2FA is already enabled. You don’t need to scan a QR code again." 
      });
    }

    // Generate a new secret and save it
    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFASecret = secret.base32;
    await user.save();

    // Generate the otpauth URL and corresponding QR Code
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(user.email + ': ChillWithPomodoro')}?secret=${secret.base32}`;
    const qrCode = await qrcode.toDataURL(otpauthUrl);

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