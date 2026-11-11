require("dotenv").config();

// required
const express = require("express");
const cors = require("cors");
const requireAuth = require("./middleware/requireAuth");
const pool = require("./db");
const tasksRouter = require("./routes/tasks.routes");
const authRouter = require("./routes/auth.routes");

// check if secret exists
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const app = express();

app.use(cors());
app.use(express.json());
app.use("/tasks", requireAuth, tasksRouter);

// check api health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// add middleware for auth routes
app.use("/auth", authRouter);

// check db connection
app.get("/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db");
    res.json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
