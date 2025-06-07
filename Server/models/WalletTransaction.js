const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["donation_sent", "donation_received"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    donationLevel: { type: Number, default: null },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    token: { type: String },
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // Optional link to donation, withdrawal etc.
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);




// const mongoose = require('mongoose');

// const walletTransactionSchema = new mongoose.Schema(
//   {
//     amount: {
//       type: Number,
//       required: true,
//     },
//     type: {
//       type: String,
//       // enum: ["deposit", "withdrawal", "donation_sent", "donation_received"],
//       enum: ["donation_sent", "donation_received"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "completed", "failed"],
//       default: "pending",
//     },
//     donationLevel: {
//       type: Number,
//       default: null,
//     },
//     fromUser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     toUser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     token: {
//       type: String,
//     },
//     referenceId: {
//       type: mongoose.Schema.Types.ObjectId, // Could reference Donation, Withdrawal, etc.
//     },
//     description: String,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);