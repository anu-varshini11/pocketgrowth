const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction"); // if you use transactions for history

// POST /api/users/allowance
// Body: { userId, amount, lockAmount }   (lockAmount optional; number)
// POST /api/users/allowance
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

    // Update balances
    user.availableBalance += amt;
    let note = `Allowance added: ₹${amt}`;

    // If locking part
    if (lock > 0) {
      user.availableBalance -= lock;
      user.lockedBalance += lock;

      note = `Allowance: ₹${amt}, Locked: ₹${lock}`;
    }

    await user.save();

    // 🔥 LOG TRANSACTION
    await Transaction.create({
      type: lock > 0 ? "lock_add" : "allowance",
      originalAmount: amt,
      amount: lock > 0 ? lock : amt,
      fromUserId: user._id,
      fromUserName: user.name,
      toUserId: user._id,
      toUserName: user.name,
      note,
    });

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
