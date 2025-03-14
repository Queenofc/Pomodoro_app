const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFASecret: { type: String, default: null }, // Google Authenticator secret
  twoFAEnabled: { type: Boolean, default: true }, // Always require 2FA
  admin_approved: { type: Boolean, default: false }, // For user approval
  isAdmin: { type: Boolean, default: false } // New field to differentiate admins
});

module.exports = mongoose.model("User", UserSchema);
