const pool = require("../db");

async function listTasks() {
  const [tasks] = await pool.query(
    "SELECT id, title, completed FROM tasks ORDER BY id"
  );
  return tasks;
}

async function createTask(title) {
  const [result] = await pool.execute(
    "INSERT INTO tasks (title) VALUES (?)",
    [title]
  );
  return { id: result.insertId, title, completed: 0 };
}

async function updateTask(id, completed) {
  const [result] = await pool.execute(
    "UPDATE tasks SET completed = ? WHERE id = ?",
    [Number(completed), id]
  );
  return result.affectedRows > 0;
}

async function deleteTask(id) {
  const [result] = await pool.execute(
    "DELETE FROM tasks WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { listTasks, createTask, updateTask, deleteTask };