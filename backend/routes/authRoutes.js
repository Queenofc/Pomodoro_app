const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Always fetch the latest user record from the database
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      isAdmin: user.isAdmin,
      admin_approved: user.admin_approved,  
      token,
      user: { 
        email: user.email, 
        isAdmin: user.isAdmin, 
        admin_approved: user.admin_approved 
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});


router.post("/logout", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "Logged out." });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
