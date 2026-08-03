const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const pool = require("./db");

dotenv.config();
console.log("PORT:", process.env.PORT);
console.log("JWT:", process.env.JWT_SECRET);
console.log("DB:", process.env.DATABASE_URL);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({ message: "Aarush API is running" });
  } catch (err) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});