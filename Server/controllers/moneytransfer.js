const mongoose = require("mongoose");
const User = require("../models/User");
const WithdrawRequest = require("../models/WithdrawRequest");
const WalletTransaction = require("../models/WalletTransaction");
exports.transferSponsorToMain = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.params.userId; // <-- Get userId from URL
    // Validate input
    if (!userId || !amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid userId or amount." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if  wallet has sufficient balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    // Deduct from  wallet
    user.walletBalance -= amount;

    // Add to Upgrade wallet
    user.upgradewalletBalance += amount;

    // Save user update
    await user.save();

    // Create wallet transaction entries
    const transactionOut = new WalletTransaction({
      amount,
      type: "fund_transfer_sent",
      status: "completed",
      fromUser: user._id,
      toUser: user._id,
      description: "Transferred from main wallet to Upgrade wallet",
    });

    const transactionIn = new WalletTransaction({
      amount,
      type: "fund_transfer_received",
      status: "completed",
      fromUser: user._id,
      toUser: user._id,
      description: "Received in upgrade wallet from main wallet",
    });

    // Save transactions
    await transactionOut.save();
    await transactionIn.save();

    // Push transaction references to user
    user.walletTransactions.push(transactionOut._id);
    user.walletTransactions.push(transactionIn._id);
    await user.save();

    res.status(200).json({
      message: "Transfer successful",
      sponserwalletBalance: user.sponserwalletBalance,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
