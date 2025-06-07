// ===== models/User.js =====
const mongoose = require("mongoose");
require("./Donation");
require("./WalletTransaction");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true,

      match: [/.+@.+\..+/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
    },

    referralCode: {
      type: String,
      unique: true,
      required: true,
    },

    referredBy: {
      type: String,
    },

    // kis bande ne ise refer code diya h signup k liye
    sponserdBy: {
      type: String,
      default: "Admin",
    },

    // tree of 2
    matrixChildren: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    currentLevel: {
      type: Number,
      default: 0,
    },

    donationsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
    ],

    donationsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
    ],

    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedForUpgrade: {
      type: Number,
      default: 0,
      min:0
    },

    walletTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WalletTransaction",
      },
    ],

    // no. of people to whome it referes
    directReferrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalWithdrawn: { type: Number, default: 0 },

    bankDetails: {
      accountNumber: String,

      accountName: String,

      bankName: String,

      ifscCode: String,
    },

    role: {
      type: String,
      enum: ["user", "Admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },

    lastLogin: Date,
  },

  {
    timestamps: true,

    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  }
);

userSchema.virtual("totalDonationsReceived").get(function () {
  return this.donationsReceived?.length;
});

userSchema.virtual("totalDonationsSent").get(function () {
  return this.donationsSent?.length;
});

// userSchema.index({ referralCode: 1 }, { unique: true });
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ referredBy: 1 });
// userSchema.index({ currentLevel: 1 });

module.exports = mongoose.model("User", userSchema);
