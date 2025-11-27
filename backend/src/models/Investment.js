const mongoose = require("mongoose");

const InvestmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    returns: { type: Number, default: 0 },
  },
  { timestamps: true } // <--- important for charts
);

module.exports = mongoose.model("Investment", InvestmentSchema);
