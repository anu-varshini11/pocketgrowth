const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

/* -----------------------------------------------
   UPDATE NAME / EMAIL
------------------------------------------------ */
router.put("/update-info", async (req, res) => {
  try {
    const { userId, name, email } = req.body;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

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
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/* -----------------------------------------------
   UPDATE SAVINGS PERCENT
------------------------------------------------ */
router.put("/update-savings-percent", async (req, res) => {
  try {
    const { userId, percent } = req.body;

    if (!userId || percent < 0 || percent > 100)
      return res.status(400).json({ error: "Invalid percent" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savingsPercent = percent;
    await user.save();

    res.json({
      message: "Savings percentage updated",
      savingsPercent: user.savingsPercent,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update savings percent" });
  }
});

/* -----------------------------------------------
   UPDATE PASSWORD
------------------------------------------------ */
router.put("/update-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Old password incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

/* -----------------------------------------------
   DELETE ACCOUNT
------------------------------------------------ */
router.delete("/delete/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // IMPORTANT: Do NOT delete transactions (you wanted history to remain)

    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
