// const User = require('../models/User');
// const WithdrawRequest = require('../models/WithdrawRequest');

// exports.WithdrawRequest = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { amount, bankDetails } = req.body;
//     console.log(req.body)

//     if (!amount || typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({ message: 'Invalid amount' });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//      const availableBalance = user.walletBalance - user.blockedForUpgrade;

//     if (amount > availableBalance) {
//       return res.status(400).json({ message: "Insufficient available balance" });
//     }

//     // Save bank details only if not already present
//     if (!user.bankDetails && bankDetails) {
//       user.bankDetails = bankDetails;
//       await user.save();
//     }

//     // Optional: Prevent multiple pending requests
//     const existing = await WithdrawRequest.findOne({ user: userId, status: 'pending' });
//     if (existing) {
//       return res.status(400).json({ message: 'A withdrawal request is already pending.' });
//     }

//     const withdrawRequest = new WithdrawRequest({
//       user: userId,
//       amount,
//       status: 'pending',
//       createdAt: new Date(),
//     });

//     await withdrawRequest.save();

//     return res.status(200).json({ message: 'Withdraw request submitted' });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };
const mongoose = require("mongoose");
const User = require("../models/User");
const WithdrawRequest = require("../models/WithdrawRequest");

// Optional: If you are tracking transactions, you can include this
const WalletTransaction = require("../models/WalletTransaction");

const MAX_WITHDRAWAL_PER_LEVEL = {
  1: 0,
  2: 100,
  3: 1000,
  4: 6000,
  5: 28000,
  6: 12000,
  7: 496000,
  8: 2016000,
  9: 8128000,
  10: 132640000,
  11: 130816000,
};

exports.WithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankDetails } = req.body;
    console.log("Withdraw request body:", req.body);

    // 🔒 Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 📦 Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🚫 Check if user has upgraded
    if (user.currentLevel < 1) {
      return res
        .status(400)
        .json({ message: "Please upgrade your account before withdrawing." });
    }

    // 💰 Calculate available balance (excluding blocked)
    const availableBalance = user.walletBalance - user.blockedForUpgrade;
    if (amount > availableBalance) {
      return res
        .status(400)
        .json({ message: "Insufficient available balance" });
    }

    // 🧮 Check max withdrawal allowed for current level
    const maxAllowed = MAX_WITHDRAWAL_PER_LEVEL[user.currentLevel] || 0;

    // 🧾 Sum total amount already withdrawn
    const totalWithdrawnResult = await WithdrawRequest.aggregate([
      { $match: { user: user._id, status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const alreadyWithdrawn =
      totalWithdrawnResult.length > 0 ? totalWithdrawnResult[0].total : 0;

    if (alreadyWithdrawn + amount > maxAllowed) {
      const remainingLimit = maxAllowed - alreadyWithdrawn;
      return res.status(400).json({
        message: `Withdrawal limit exceeded. Max allowed for Level ${user.currentLevel} is ₹${maxAllowed}.`,
        alreadyWithdrawn,
        remainingLimit,
      });
    }

    // 🏦 Save bank details if not already stored
    if (!user.bankDetails && bankDetails) {
      user.bankDetails = bankDetails;
      await user.save();
    }

    // 🚫 Prevent multiple pending requests
    const existing = await WithdrawRequest.findOne({
      user: userId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A withdrawal request is already pending." });
    }

    // 📝 Create withdraw request
    const withdrawRequest = new WithdrawRequest({
      user: userId,
      amount,
      status: "pending",
      createdAt: new Date(),
    });

    await withdrawRequest.save();

    return res
      .status(200)
      .json({ message: "Withdraw request submitted successfully." });
  } catch (err) {
    console.error("Withdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await WithdrawRequest.findById(id).populate("user");
    if (!request)
      return res.status(404).json({ message: "Withdraw request not found" });

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is already processed" });
    }

    const user = request.user;

    if (status === "approved") {
      // 🚫 Must have upgraded
      if (user.currentLevel < 1) {
        return res
          .status(400)
          .json({
            message: "User must upgrade to Level 1 before withdrawing.",
          });
      }

      const availableBalance = user.walletBalance - user.blockedForUpgrade;
      if (request.amount > availableBalance) {
        return res
          .status(400)
          .json({ message: "Insufficient available balance." });
      }

      // ✅ Get allowed limit for their current level
      const userLevel = user.currentLevel;
      const maxAllowed = MAX_WITHDRAWAL_PER_LEVEL[userLevel] || 0;

      // ✅ Sum of previously approved withdrawals
      const totalWithdrawnResult = await WithdrawRequest.aggregate([
        { $match: { user: user._id, status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const alreadyWithdrawn =
        totalWithdrawnResult.length > 0 ? totalWithdrawnResult[0].total : 0;
      const remainingLimit = maxAllowed - alreadyWithdrawn;

      if (request.amount > remainingLimit) {
        return res.status(400).json({
          message: `Withdrawal not allowed. User must upgrade to withdraw more.`,
          currentLevel: userLevel,
          maxAllowed,
          alreadyWithdrawn,
          remainingLimit,
        });
      }

      // ✅ Deduct balance
      user.walletBalance -= request.amount;
      user.totalWithdrawn += request.amount;

      await user.save();
    }

    request.status = status;
    await request.save();

    return res
      .status(200)
      .json({ message: `Withdrawal ${status} successfully.` });
  } catch (err) {
    console.error("Admin withdrawal update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// GET /api/v1/withdraw/summary
exports.getWithdrawSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await WithdrawRequest.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const alreadyWithdrawn = result.length > 0 ? result[0].total : 0;

    res.json({ alreadyWithdrawn });
  } catch (err) {
    console.error("Withdraw summary error:", err);
    res.status(500).json({ message: "Failed to get withdraw summary." });
  }
};
