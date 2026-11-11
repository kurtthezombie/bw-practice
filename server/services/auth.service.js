const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

async function login(email, password) {
  const [rows] = await pool.execute(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email]
  );

  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return null;
  }

  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: String(user.id),
    expiresIn: "1h",
  });
}

module.exports = { login };