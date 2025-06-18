const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      // **UPDATED ENUM VALUES HERE**
      enum: [
       "donation_sent",
        "donation_received",
        "upgrade_payment_sent",         // When a user pays for an upgrade
        "upline_upgrade_commission",    // When an upline receives an upgrade payment from a downline
        "admin_upgrade_revenue",        // When admin receives an upgrade payment due to no eligible upline
        "deposit",
        "withdrawal",
        "fund_transfer_sent",
        "fund_transfer_received",
        "admin",
        "sponsor_commission",
        "admin_sponsor_share",
        "upline_combined_upgrade_commission_and_sponsor_commission",
        "admin_combined_upgrade_revenue_and_sponsor_share",
        "upgrade_payment_sent_and_sponsor_share_sent",
                "withdrawal_approved_sponser_wallet",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    donationLevel: { type: Number, default: null }, // Good for tracking which level upgrade this was
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    token: { type: String }, // If this is used for payment gateway tokens, etc.
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // Optional link to Donation, Withdrawal, etc.
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
