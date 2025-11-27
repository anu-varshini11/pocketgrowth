const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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

    if ((user.lockedBalance || 0) < numAmount)
      return res.status(400).json({ error: "Not enough locked savings" });

    // Deduct from locked savings and add to available balance
    user.lockedBalance -= numAmount;
    user.availableBalance = (user.availableBalance || 0) + numAmount;

    await user.save();

    // Create an unlock transaction with reason
    await Transaction.create({
      type: "unlock",
      originalAmount: numAmount,
      amount: numAmount,
      toUserId: user._id,
      toUserName: user.name,
      note: reason || "Unlocked savings",
      isProcessed: true,
    });

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
