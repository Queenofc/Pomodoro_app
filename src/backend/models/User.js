const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  twoFASecret: { type: String, default: null }, // Stores Google Authenticator secret
  twoFAEnabled: { type: Boolean, default: true } // Always require 2FA
});

module.exports = mongoose.model("User", UserSchema);
