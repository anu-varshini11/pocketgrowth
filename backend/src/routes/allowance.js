const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const router = express.Router();

// POST /api/users/allowance
// Body: { userId, amount, lockAmount } (lockAmount optional)
router.post("/allowance", async (req, res) => {
  try {
    const { userId, amount, lockAmount } = req.body;
    const amt = parseFloat(amount);
    const lock = parseFloat(lockAmount || 0);

    if (!userId || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    if (lock < 0 || lock > amt) {
      return res.status(400).json({ error: "Invalid lock amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Add to available balance first
    user.availableBalance = (user.availableBalance || 0) + amt;

    // Log allowance addition
    await Transaction.create({
      type: "allowance",
      originalAmount: amt,
      amount: amt,
      toUserId: user._id,
      toUserName: user.name,
      note: `Allowance added: ₹${amt}`,
      isProcessed: true,
    });

    // If locking some amount, move it to lockedBalance and log lock_add
    if (lock > 0) {
      user.availableBalance -= lock;
      user.lockedBalance = (user.lockedBalance || 0) + lock;

      await Transaction.create({
        type: "lock_add",
        originalAmount: lock,
        amount: lock,
        toUserId: user._id,
        toUserName: user.name,
        note: `Moved ₹${lock} to locked savings`,
        isProcessed: true,
      });
    }

    await user.save();

    res.json({
      message: "Allowance added",
      availableBalance: user.availableBalance,
      lockedBalance: user.lockedBalance,
    });
  } catch (err) {
    console.error("Allowance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
