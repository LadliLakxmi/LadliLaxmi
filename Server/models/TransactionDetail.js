const mongoose = require("mongoose");

const TransactionDetailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    Referalcode: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    UTRno: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true } // ✅ This enables createdAt and updatedAt
);

module.exports = mongoose.model("TransactionDetail", TransactionDetailSchema);
