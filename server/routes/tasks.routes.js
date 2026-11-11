const express = require("express");
const tasksController = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", tasksController.listTasks);
router.post("/", tasksController.createTask);
router.patch("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);

module.exports = router;