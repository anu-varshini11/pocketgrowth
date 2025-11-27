const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    // 🔥 Unified event type
    type: {
      type: String,
      enum: [
        "send",
        "receive",
        "allowance",
        "lock_add",
        "unlock",
        "invest",
        "growth",
      ],
      required: true,
    },

    // For all money-related actions
    originalAmount: { type: Number, required: true },
    amount: { type: Number, required: true },

    // Sender fields (send/invest/growth)
    fromUserId: { type: mongoose.Types.ObjectId, ref: "User" },
    fromUserName: { type: String },

    // Receiver fields (receive/allowance/unlock)
    toUserId: { type: mongoose.Types.ObjectId, ref: "User" },
    toUserEmail: { type: String },
    toUserName: { type: String },

    // For unlock reason, invest type, etc.
    note: { type: String },

    // For receive transactions only
    isProcessed: { type: Boolean, default: true }, // default true for non-receive events
  },
  { timestamps: true } // adds createdAt AND updatedAt
);

module.exports = mongoose.model("Transaction", TransactionSchema);
