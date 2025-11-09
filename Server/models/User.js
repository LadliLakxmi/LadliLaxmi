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
    updationPassword: {
      type: String,
      select: false, // hide from queries for security
    },

    phone: {
      type: String,
      trim: true,
      sparse: true, // Allows null/undefined if not unique
      // required:true
      // Consider adding a unique constraint if phone numbers should be unique,
      // but use 'sparse: true' if some users might not have one.
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
    panCard: {
      type: String,
      trim: true,
      uppercase: true, // PAN cards are typically uppercase
      unique: true, // A PAN card should be unique per user
      sparse: true, // Allows null/undefined for users who haven't added it yet
      match: [
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // Basic Indian PAN card format regex
        "Please enter a valid Indian PAN card number (e.g., ABCDE1234F)",
      ],
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
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String }, // Add UPI ID here
      bankProof: {
        type: String, // Cloudinary URL
        default: "",},
    },
    bankProofVerified: {
      type: String,
      enum: ["pending", "verified", "rejected", ""],
      default: "" // "" means no proof uploaded yet
    },
    EmergencyWallet: {
      type: Number,
      default: 0,
      min: 0,
    },
    upgradewalletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    role: {
      type: String,
      enum: ["user", "Admin"],
      default: "user",
    },
    otp: {
      type: String,
      select: false, // Don't return OTP in queries by default
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type:String,
      select: false,          // Token for password reset link
    },
    resetPasswordExpires:{
       type:  Date,
       select:false,          // Token expiry time 
      },

    isActive: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
    },
    levelPaymentsReceived: {
      type: Map,
      of: Number,
      default: {},
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
