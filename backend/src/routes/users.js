const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction"); // if you use transactions for history

// POST /api/users/allowance
// Body: { userId, amount, lockAmount }   (lockAmount optional; number)
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

    // Add to available, then move lock to lockedBalance
    user.availableBalance = (user.availableBalance || 0) + amt;

    if (lock > 0) {
      // move 'lock' from available to lockedBalance
      user.availableBalance -= lock;
      user.lockedBalance = (user.lockedBalance || 0) + lock;
    }

    await user.save();

    // optional: log transactions for allowance and lock
    // await Transaction.create({ type: "allowance", amount: amt, toUserId: user._id, toUserName: user.name });
    // if (lock > 0) await Transaction.create({ type: "lock", amount: lock, toUserId: user._id, toUserName: user.name });

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
