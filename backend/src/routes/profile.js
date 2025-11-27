const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");

const router = express.Router();

// PUT /api/profile/update
// Body: { userId, name, email }
router.put("/update", async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // If email changing, ensure unique
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "Email already in use" });
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        availableBalance: user.availableBalance,
        lockedBalance: user.lockedBalance,
        savingsPercent: user.savingsPercent,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// PUT /api/profile/password
// Body: { userId, oldPassword, newPassword }
router.put("/password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const matches = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!matches) return res.status(400).json({ error: "Old password incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hash;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// PUT /api/profile/savings
// Body: { userId, savingsPercent }
router.put("/savings", async (req, res) => {
  try {
    const { userId, savingsPercent } = req.body;
    if (!userId || savingsPercent == null) return res.status(400).json({ error: "Missing fields" });

    const pct = Number(savingsPercent);
    if (isNaN(pct) || pct < 0 || pct > 100) return res.status(400).json({ error: "Invalid percent" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savingsPercent = pct;
    await user.save();

    res.json({ message: "Auto-save percentage updated", savingsPercent: user.savingsPercent });
  } catch (err) {
    console.error("Savings percent error:", err);
    res.status(500).json({ error: "Failed to update savings percent" });
  }
});

// DELETE /api/profile/delete
// Body: { userId }
// Permanently deletes user and related investments & transactions
router.delete("/delete", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // delete related data
    await Investment.deleteMany({ userId: user._id });
    await Transaction.deleteMany({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    });

    await user.deleteOne();

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
