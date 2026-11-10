const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/tasks", async (req, res) => {
  try {
    const [tasks] = await pool.query(
      "SELECT id, title, completed FROM tasks ORDER BY id"
    );
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/tasks", async (req, res) => {
  const title = req.body?.title;

  if (typeof title !== "string" || !title.trim() || title.trim().length > 255) {
    return res.status(400).json({ error: "Title must be 1–255 characters" });
  }

  const trimmedTitle = title.trim();

  try {
    const [result] = await pool.execute(
      "INSERT INTO tasks (title) VALUES (?)",
      [trimmedTitle]
    );

    res.status(201).json({
      id: result.insertId,
      title: trimmedTitle,
      completed: 0,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const completed = req.body?.completed;

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be true or false" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      [Number(completed), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email.trim()]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({}, jwtSecret, {
      algorithm: "HS256",
      subject: String(user.id),
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Login failed" });
  }
});


// insert above the routes

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});


app.get("/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS db");
    res.json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});