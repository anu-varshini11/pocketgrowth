const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST /api/allowance/add
// Body: { userId, amount, lockAmount }  (lockAmount optional)
router.post("/add", async (req, res) => {
  try {
    const { userId, amount, lockAmount } = req.body;
    const numAmount = Number(amount);
    const lock = Number(lockAmount || 0);

    if (!userId || !numAmount || numAmount <= 0)
      return res.status(400).json({ error: "Invalid request data" });

    if (isNaN(lock) || lock < 0 || lock > numAmount)
      return res.status(400).json({ error: "Invalid lock amount" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Add full amount to available, then move lockAmount (if provided)
    user.availableBalance = (user.availableBalance || 0) + numAmount;

    if (lock > 0) {
      user.availableBalance -= lock;
      user.lockedBalance = (user.lockedBalance || 0) + lock;
    }

    await user.save();

    res.json({
      message:
        lock > 0
          ? `✅ Added ₹${numAmount} — locked ₹${lock}.`
          : `✅ Added ₹${numAmount} to available balance.`,
      availableBalance: user.availableBalance,
      lockedBalance: user.lockedBalance,
    });
  } catch (error) {
    console.error("Add allowance error:", error);
    res.status(500).json({ error: "Failed to add allowance" });
  }
});

module.exports = router;
