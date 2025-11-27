const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Investment = require("../models/Investment");
require("dotenv").config();

const router = express.Router();

// ✅ POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      availableBalance: 0,
      lockedBalance: 0,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 RETURN FULL USER including balances (fixes blank dashboard)
    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        availableBalance: newUser.availableBalance,
        lockedBalance: newUser.lockedBalance,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ POST /api/auth/login
// POST /api/auth/login
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: "Invalid password" });

    // Auto-growth only once per login
    try {
      const investments = await Investment.find({ userId: user._id });
      const DAILY_GROWTH_RATE = 0.002; // 0.2%

      for (let inv of investments) {
        const growth = inv.amount * DAILY_GROWTH_RATE;
        inv.returns += growth;
        await inv.save();
      }
    } catch (err) {
      console.error("Growth error:", err);
      // DO NOT FAIL LOGIN if growth fails
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        availableBalance: user.availableBalance,
        lockedBalance: user.lockedBalance,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});



// ✅ GET /api/auth/user/:id – refresh dashboard balances
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      availableBalance: user.availableBalance,
      lockedBalance: user.lockedBalance,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
