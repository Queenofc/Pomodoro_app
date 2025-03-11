require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const twofaRoutes = require("./routes/twofaRoutes");

const app = express();

// Middleware
const corsOptions = {
  origin:"http://localhost:3001" , // Allow frontend
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific methods
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.options("*", cors(corsOptions)); // Handle CORS preflight

// Connect to MongoDB
connectDB();

// Mount routes
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/2fa", twofaRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// Start server locally but NOT on Vercel (Vercel auto-handles it)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Server runs on port ${PORT}`);
  });
} else {
  console.log("🚀 Running on Vercel...");
}

// Export app for Vercel
module.exports = app;
