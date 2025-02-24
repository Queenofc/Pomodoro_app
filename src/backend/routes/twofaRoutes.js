const express = require("express");
const qrcode = require("qrcode");
const speakeasy = require("speakeasy");
const User = require("../models/User");
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post("/enable-2fa", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate a secret key for 2FA
    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFASecret = secret.base32;
    await user.save();

    // Respond with the secret key (for the authenticator app)
    res.json({ success: true, secret: secret.base32 });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Verify the 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 1, // Allow a 30-second window for code validation
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid 2FA code" });
    }

    // Generate a JWT token for authenticated access
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Respond with success and token
    res.json({ success: true, message: "2FA verified", token });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
