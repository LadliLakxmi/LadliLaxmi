// ===== models/Donation.js =====
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true },

    receiver: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true },

    amount: {
       type: Number,
       required: true,
       min: 0 },

    currentLevel: {
       type: Number,
       required: true,
       min: 0 },

    status: {
       type: String,
       enum: ["pending",
       "approved",
       "rejected",
       "completed"],
       default: "pending" },

    approvedAt: {
       type: Date,
       default: null },

    transactionId: {
       type: String,
       unique: true,
       sparse:true,
       }
  },

  {
    timestamps: true,
    toJSON: {
       virtuals: true
       },
    toObject: {
       virtuals: true }
  }
);

donationSchema.index({donor: 1, status: 1 });
donationSchema.index({receiver: 1,status: 1 });
donationSchema.index({createdAt: 1 });

module.exports = mongoose.model("Donation",donationSchema);