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
      type: Number,
      required: true,
    },
    UTRno: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    index: true,
      set: (value) => value.replace(/\s+/g, ""), // ✅ removes all spaces inside string
    },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
  },
  { timestamps: true } // ✅ This enables createdAt and updatedAt
);

module.exports = mongoose.model("TransactionDetail", TransactionDetailSchema);
