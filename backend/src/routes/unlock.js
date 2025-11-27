const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST /api/unlock
router.post("/", async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const numAmount = Number(amount);

    if (!userId || !numAmount || numAmount <= 0)
      return res.status(400).json({ error: "Invalid request data" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.lockedBalance < numAmount)
      return res.status(400).json({ error: "Not enough locked savings" });

    // Deduct from locked savings and add to available balance
    user.lockedBalance -= numAmount;
    user.availableBalance += numAmount;

    await user.save();

    res.json({
      message: `✅ Unlocked ₹${numAmount} for "${reason || "general use"}".`,
      availableBalance: user.availableBalance,
      lockedBalance: user.lockedBalance,
    });
  } catch (error) {
    console.error("Unlock savings error:", error);
    res.status(500).json({ error: "Failed to unlock savings" });
  }
});

module.exports = router;
