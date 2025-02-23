const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  twoFASecret: { type: String, default: null }, // Stores the Google Authenticator secret
  twoFAEnabled: { type: Boolean, default: false } // Checks if 2FA is enabled
});

module.exports = mongoose.model("User", UserSchema);
