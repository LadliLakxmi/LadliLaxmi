// ===== controllers/withdrawController.js (No Cumulative Limits) =====
const mongoose = require("mongoose");
const User = require("../models/User");
const WithdrawRequest = require("../models/WithdrawRequest");
const WalletTransaction = require("../models/WalletTransaction");
const { v4: uuidv4 } = require("uuid"); // Import uuid for transaction IDs

exports.WithdrawRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const { amount, bankDetails } = req.body;

    // 🔒 Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 📦 Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    // Always use user.walletBalance for availableBalance
    const availableBalance = user.walletBalance;

    // 🚫 Check if user has upgraded to Level 1 before any withdrawals
    if (user.currentLevel < 1) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Please upgrade your account to Level 1 before withdrawing." });
    }

    // Removed all cumulative withdrawal limit checks from here
    // Removed checks like currentAlreadyWithdrawn + amount > maxAllowedCumulative

    if (amount > availableBalance) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Insufficient available balance in your wallet.` });
    }

    // --- Bank Details Saving Logic ---
    // If user doesn't have bank details saved, or if any field is missing, require them in the request
    if (
      !user.bankDetails ||
      !user.bankDetails.accountNumber ||
      !user.bankDetails.accountHolder ||
      !user.bankDetails.ifscCode ||
      !user.bankDetails.bankName
    ) {
      if (
        !bankDetails ||
        !bankDetails.accountHolder ||
        !bankDetails.accountNumber ||
        !bankDetails.ifscCode ||
        !bankDetails.bankName
      ) {
        await session.abortTransaction();
        return res.status(400).json({
          message:
            "All bank details fields including account holder name, account number, IFSC code, bank name are required to submit a withdrawal request.",
        });
      }
      user.bankDetails = {
        accountHolder: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        upiId: bankDetails.upiId || "" // Save UPI ID if provided, otherwise empty string
      };
      await user.save({ session });
    }
    // --- End Bank Details Saving Logic ---

    // 🚫 Prevent multiple pending requests (globally for the single wallet)
    const existing = await WithdrawRequest.findOne({
      user: userId,
      status: "pending",
    }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `A withdrawal request is already pending. Please wait for it to be processed.`,
      });
    }

    // 📝 Create withdraw request
    const withdrawRequest = new WithdrawRequest({
      user: userId,
      amount,
      status: "pending",
      createdAt: new Date(),
    });

    await withdrawRequest.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      message: "Withdraw request submitted successfully. It will be processed shortly.",
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Withdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

exports.updateWithdrawStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await WithdrawRequest.findById(id)
      .populate("user")
      .session(session);
    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Withdraw request not found" });
    }

    if (request.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Request is already processed" });
    }

    const user = request.user;

    if (status === "approved") {
      let currentBalance = user.walletBalance;
      let totalWithdrawnField = "totalWithdrawn";
      let transactionType = "withdrawal_approved";

      // 🚫 User must be Level 1 or higher for approval (consistent with request initiation)
      if (user.currentLevel < 1) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            message: "User must be Level 1 or higher to approve this withdrawal.",
          });
      }

      // Removed all cumulative withdrawal limit checks from here
      // Removed checks like request.amount > remainingLimit

      if (request.amount > currentBalance) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            message: `Insufficient available balance in user's wallet to approve this request.`,
          });
      }

      // Deduct balance from the main wallet
      user.walletBalance -= request.amount;

      // Update total withdrawn
      user[totalWithdrawnField] += request.amount;

      // Create a WalletTransaction record
      const transactionId = uuidv4();
      const walletTxn = new WalletTransaction({
        user: user._id,
        amount: -request.amount,
        type: transactionType,
        fromUser:"683949730c453de29aa39b83",
        toUser:user._id,
        status: "completed",
        description: `Withdrawal approved.`,
        transactionId: transactionId,
        processedAt: new Date(),
      });
      await walletTxn.save({ session });
      user.walletTransactions.push(walletTxn._id);

      await user.save({ session });
    } else if (status === "rejected") {
      // If rejected, do nothing to the balance, just update status
    }

    request.status = status;
    request.processedAt = new Date(); // Record when it was processed
    await request.save({ session });

    await session.commitTransaction();

    return res
      .status(200)
      .json({ message: `Withdrawal request ${status} successfully.` });
  } catch (err) {
    await session.abortTransaction();
    console.error("Admin withdrawal update error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

// GET /api/v1/withdraw/summary
// This endpoint now only gets the already withdrawn amount (no limits involved for display)
exports.getWithdrawSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    let matchCondition = {
      user: new mongoose.Types.ObjectId(userId),
      status: "approved",
    };

    const result = await WithdrawRequest.aggregate([
      { $match: matchCondition },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const alreadyWithdrawn = result.length > 0 ? result[0].total : 0;

    // Only return alreadyWithdrawn
    res.json({ alreadyWithdrawn });
  } catch (err) {
    console.error("Withdraw summary error:", err);
    res.status(500).json({ message: "Failed to get withdraw summary." });
  }
};

// GET /api/v1/withdraw/my-requests
exports.getMyWithdrawRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all withdrawal requests for this user, sorted by creation date (newest first)
    const withdrawRequests = await WithdrawRequest.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("amount status createdAt"); // Select relevant fields

    if (!withdrawRequests || withdrawRequests.length === 0) {
      return res
        .status(200)
        .json({ message: "No withdrawal requests found for this user.", requests: [] });
    }

    return res.status(200).json({
      message: "Withdrawal requests fetched successfully.",
      requests: withdrawRequests,
    });
  } catch (err) {
    console.error("Error fetching user's withdrawal requests:", err);
    return res
      .status(500)
      .json({ message: "Server error while fetching withdrawal requests." });
  }
};

