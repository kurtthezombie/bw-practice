const tasksService = require("../services/tasks.service");

async function listTasks(req, res) {
  try {
    res.json(await tasksService.listTasks());
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

async function createTask(req, res) {
  const title = req.body?.title;

  if (typeof title !== "string" || !title.trim() || title.trim().length > 255) {
    return res.status(400).json({ error: "Title must be 1–255 characters" });
  }

  try {
    const task = await tasksService.createTask(title.trim());
    res.status(201).json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
}

async function updateTask(req, res) {
  const id = Number(req.params.id);
  const completed = req.body?.completed;

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be true or false" });
  }

  try {
    const updated = await tasksService.updateTask(id, completed);
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to update task" });
  }
}

async function deleteTask(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const deleted = await tasksService.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };