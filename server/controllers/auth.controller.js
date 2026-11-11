const authService = require("../services/auth.service");

async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || !password
  ) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const token = await authService.login(email.trim(), password);

    if (!token) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { login };