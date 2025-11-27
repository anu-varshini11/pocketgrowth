const express = require("express");
const Investment = require("../models/Investment");
const User = require("../models/User");

const router = express.Router();

// 📌 Auto growth rate — adjust if needed
const DAILY_GROWTH_RATE = 0.002; // 0.2% per visit

// POST /api/investments/add
router.post("/add", async (req, res) => {
  try {
    const { userId, type, amount, returns } = req.body;
    const amt = parseFloat(amount);
    if (!userId || !type || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if ((user.lockedBalance || 0) < amt) {
      return res.status(400).json({
        error: "Insufficient locked balance. Invest from locked savings only.",
      });
    }

    user.lockedBalance -= amt;
    await user.save();

    const newInvestment = new Investment({
      userId,
      type,
      amount: amt,
      returns: returns || 0,
    });
    await newInvestment.save();

    res.status(201).json({
      message: `✅ Investment of ₹${amt} created (from locked savings)`,
      investment: newInvestment,
      availableBalance: user.availableBalance,
      lockedBalance: user.lockedBalance,
    });
  } catch (error) {
    console.error("Add investment error:", error);
    res.status(500).json({ error: "Failed to add investment" });
  }
});

// GET /api/investments/:userId (with AUTO-GROWTH)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const investments = await Investment.find({ userId }).sort({ createdAt: -1 });

    const totalInvested = investments.reduce((s, inv) => s + inv.amount, 0);
    const totalReturns = investments.reduce((s, inv) => s + inv.returns, 0);
    const netWorth = totalInvested + totalReturns;

    res.json({
      totalInvested,
      totalReturns,
      netWorth,
      investments,
    });
  } catch (error) {
    console.error("Fetch investments error:", error);
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});


module.exports = router;
