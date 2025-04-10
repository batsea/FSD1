const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const user = new User({ name, email, password });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "secret123", { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
