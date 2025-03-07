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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount routes
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);
app.use("/2fa", twofaRoutes);

app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.send("Server is running in production mode!");
  } else {
    res.send("Development server is running.");
  }
});

// Only start the server when running locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("✅ Server runs on port " + PORT);
  });
}

// Export the app for Vercel
module.exports = app;
