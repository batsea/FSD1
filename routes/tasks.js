const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require login
router.use(auth);

// Create task
router.post("/", async (req, res) => {
  const { title, description, dueDate, status } = req.body;
  try {
    const task = new Task({
      title,
      description,
      dueDate,
      status,
      assignedTo: req.userId,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get all tasks for user
router.get("/", async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.userId });
  res.json(tasks);
});

// Get one task
router.get("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, assignedTo: req.userId });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// Update task
router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, assignedTo: req.userId },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, assignedTo: req.userId });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Task deleted" });
});

module.exports = router;
