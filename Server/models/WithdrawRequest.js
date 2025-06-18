const mongoose = require("mongoose");
require("./User");
const withdrawRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
    // --- NEW: Add walletType ---
    walletType: {
      type: String,
      enum: ["main", "sponser"],
      required: true,
      default: "main", // Default to 'main' for existing requests or if not specified
    },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approved", "rejected"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);
