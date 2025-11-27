const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// POST /api/transactions/send
// Body: { fromUserId, toUserEmail, amount }
router.post("/send", async (req, res) => {
  try {
    const { fromUserId, toUserEmail, amount } = req.body;
    const sendAmount = parseFloat(amount);

    if (!fromUserId || !toUserEmail || !sendAmount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const sender = await User.findById(fromUserId);
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    if (sender.availableBalance < sendAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const receiver = await User.findOne({ email: toUserEmail });
    if (!receiver) return res.status(404).json({ error: "Recipient not found" });

    // Deduct full amount from sender immediately
    sender.availableBalance -= sendAmount;
    await sender.save();

    // Create a "send" transaction (for history)
    const sendTx = new Transaction({
      type: "send",
      originalAmount: sendAmount,
      amount: sendAmount,
      fromUserId: sender._id,
      fromUserName: sender.name,
      toUserId: receiver._id,
      toUserEmail: receiver.email,
      toUserName: receiver.name,
    });
    await sendTx.save();

    // Create a pending "receive" transaction for receiver to process
    const receiveTx = new Transaction({
      type: "receive",
      originalAmount: sendAmount,
      amount: sendAmount, // receiver will decide processing
      fromUserId: sender._id,
      fromUserName: sender.name,
      toUserId: receiver._id,
      toUserEmail: receiver.email,
      toUserName: receiver.name,
      isProcessed: false,
    });
    await receiveTx.save();

    res.json({
      message: `✅ Sent ₹${sendAmount} to ${receiver.name}. Recipient will process the incoming funds.`,
      senderBalance: sender.availableBalance,
      sendTxId: sendTx._id,
      receiveTxId: receiveTx._id,
    });
  } catch (error) {
    console.error("Send error:", error);
    res.status(500).json({ error: "Failed to send money" });
  }
});

// GET /api/transactions/received/pending/:userId
router.get("/received/pending/:userId", async (req, res) => {
  try {
    const list = await Transaction.find({
      toUserId: req.params.userId,
      type: "receive",
      isProcessed: false,
    }).sort({ createdAt: -1 });

    res.json({ transactions: list });
  } catch (error) {
    console.error("Pending receive fetch error:", error);
    res.status(500).json({ error: "Failed to fetch pending received money" });
  }
});

// POST /api/transactions/process
// Body: { transactionId, mode, percentage?, customAmount? }
router.post("/process", async (req, res) => {
  try {
    const { transactionId, mode, percentage, customAmount } = req.body;

    if (!transactionId || !mode) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.isProcessed) return res.status(400).json({ error: "Already processed" });

    const receiver = await User.findById(tx.toUserId);
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    const amount = tx.amount;

    if (mode === "full") {
      // Receiver wants full money into availableBalance
      receiver.availableBalance += amount;

    } else if (mode === "percentage") {
      // Receiver chooses a fixed % (like 10%)
      const pct = parseFloat(percentage);
      const save = (amount * pct) / 100;
      const spend = amount - save;

      receiver.lockedBalance += save;
      receiver.availableBalance += spend;

    } else if (mode === "custom") {
      // Receiver manually enters savings amount
      const save = parseFloat(customAmount);
      if (save < 0 || save > amount) {
        return res.status(400).json({ error: "Invalid custom amount" });
      }

      receiver.lockedBalance += save;
      receiver.availableBalance += (amount - save);
    }

    // Mark transaction processed
    tx.isProcessed = true;
    await tx.save();
    await receiver.save();

    res.json({
      message: "✅ Received money processed!",
      availableBalance: receiver.availableBalance,
      lockedBalance: receiver.lockedBalance,
    });

  } catch (error) {
    console.error("Process error:", error);
    res.status(500).json({ error: "Failed to process transaction" });
  }
});

// GET /api/transactions/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const transactions = await Transaction.find({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ],
      isProcessed: true, // ONLY show completed transactions
    }).sort({ createdAt: -1 });

    res.json({ transactions });

  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});


module.exports = router;
