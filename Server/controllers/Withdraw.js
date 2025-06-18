// ===== controllers/withdrawController.js =====
const mongoose = require("mongoose");
const User = require("../models/User");
const WithdrawRequest = require("../models/WithdrawRequest");
const WalletTransaction = require("../models/WalletTransaction");
const { v4: uuidv4 } = require("uuid"); // Import uuid for transaction IDs

// Define MAX_WITHDRAWAL_PER_LEVEL as the *individual* limit for each level,
// and we will sum them up dynamically.
const INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL = {
  1: 0,
  2: 100,
  3: 1000,
  4: 6000,
  5: 28000,
  6: 120000,
  7: 496000,
  8: 2016000,
  9: 8128000,
  10: 32640000,
  11: 130816000,
};

// Helper function to calculate cumulative max withdrawal for the main wallet
function calculateCumulativeMaxWithdrawal(currentLevel) {
  let cumulativeMax = 0;
  for (let level = 1; level <= currentLevel; level++) {
    cumulativeMax += INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL[level] || 0;
  }
  return cumulativeMax;
}

exports.WithdrawRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    // --- NEW: Accept walletType in body (e.g., 'main' or 'sponser') ---
    const { amount, bankDetails, walletType } = req.body;
    console.log("Withdraw request body:", req.body);


    // 🔒 Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 🔒 Validate walletType
    if (!walletType || !["main", "sponser"].includes(walletType)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid wallet type. Must be 'main' or 'sponser'.",
      });
    }

    // 📦 Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    let availableBalance;
    let totalWithdrawnField; // To track which field on User model to update (totalWithdrawn or totalSponserWithdrawn)

    if (walletType === "main") {
      availableBalance = user.walletBalance;
      totalWithdrawnField = "totalWithdrawn";

      // 🚫 Check if user has upgraded for main wallet withdrawals
      if (user.currentLevel < 1) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Please upgrade your account to Level 1 before withdrawing from the main wallet." });
      }

      // 🧮 Calculate CUMULATIVE max withdrawal allowed for current level
      const maxAllowedCumulative = calculateCumulativeMaxWithdrawal(
        user.currentLevel
      );

      // 🧾 Sum total amount already withdrawn from main wallet (approved requests only)
      const alreadyWithdrawnMain = await WithdrawRequest.aggregate([
        {
          $match: {
            user: user._id,
            status: "approved",
            walletType: "main",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).session(session);

      const currentAlreadyWithdrawn =
        alreadyWithdrawnMain.length > 0 ? alreadyWithdrawnMain[0].total : 0;

      if (currentAlreadyWithdrawn + amount > maxAllowedCumulative) {
        const remainingLimit = Math.max(
          0,
          maxAllowedCumulative - currentAlreadyWithdrawn
        );
        await session.abortTransaction();
        return res.status(400).json({
          message: `Withdrawal limit exceeded for main wallet. Max cumulative allowed for your current level (Level ${user.currentLevel}) is ₹${maxAllowedCumulative}. You have already withdrawn ₹${currentAlreadyWithdrawn}. Remaining limit: ₹${remainingLimit}.`,
          alreadyWithdrawn: currentAlreadyWithdrawn,
          remainingLimit,
          maxAllowed: maxAllowedCumulative,
        });
      }
    } else if (walletType === "sponser") {
      availableBalance = user.sponserwalletBalance;
      totalWithdrawnField = "totalSponserWithdrawn";
      // No level restrictions for sponser wallet withdrawal
      // No cumulative limit for sponser wallet withdrawal
    }

    if (amount > availableBalance) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Insufficient available balance in ${walletType} wallet.` });
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
        accountHolder: bankDetails.accountHolder, // Use bankDetails from req.body
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
      };
      await user.save({ session });
    }
    // --- End Bank Details Saving Logic ---

    // 🚫 Prevent multiple pending requests for the *same wallet type*
    const existing = await WithdrawRequest.findOne({
      user: userId,
      status: "pending",
      walletType: walletType, // Check for pending requests for the specific wallet
    }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `A withdrawal request for your ${walletType} wallet is already pending. Please wait for it to be processed.`,
      });
    }

    // 📝 Create withdraw request
    const withdrawRequest = new WithdrawRequest({
      user: userId,
      amount,
      status: "pending",
      createdAt: new Date(),
      walletType: walletType, // Store the wallet type
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
    const { status,walletType } = req.body;

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
      console.log("Upadte k time kaa data: ",request)

    if (request.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Request is already processed" });
    }

    const user = request.user;

    if (status === "approved") {
      let currentBalance;
      let totalWithdrawnField;
      let transactionType;

      if (request.walletType === "main") {
        currentBalance = user.walletBalance;
        totalWithdrawnField = "totalWithdrawn";
        transactionType = "withdrawal_approved_main_wallet";

        // 🚫 Must have upgraded for main wallet withdrawal
        if (user.currentLevel < 1) {
          await session.abortTransaction();
          return res
            .status(400)
            .json({
              message: "User must upgrade to Level 1 before withdrawing from main wallet.",
            });
        }

        // ✅ Calculate CUMULATIVE allowed limit for their current level (main wallet)
        const userLevel = user.currentLevel;
        const maxAllowedCumulative = calculateCumulativeMaxWithdrawal(userLevel);

        // ✅ Sum of previously approved withdrawals from main wallet
        const totalWithdrawnResultMain = await WithdrawRequest.aggregate([
          {
            $match: {
              user: user._id,
              status: "approved",
              walletType: "main",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]).session(session);

        const alreadyWithdrawnMain =
          totalWithdrawnResultMain.length > 0
            ? totalWithdrawnResultMain[0].total
            : 0;
        const remainingLimitMain = Math.max(
          0,
          maxAllowedCumulative - alreadyWithdrawnMain
        );

        if (request.amount > remainingLimitMain) {
          await session.abortTransaction();
          return res.status(400).json({
            message: `Withdrawal not allowed for main wallet. User has reached or exceeded the cumulative withdrawal limit for Level ${userLevel}. Max cumulative allowed: ₹${maxAllowedCumulative}, Already withdrawn: ₹${alreadyWithdrawnMain}, Request amount: ₹${request.amount}.`,
            currentLevel: userLevel,
            maxAllowed: maxAllowedCumulative,
            alreadyWithdrawn: alreadyWithdrawnMain,
            remainingLimit: remainingLimitMain,
          });
        }
      } else if (request.walletType === "sponser") {
        currentBalance = user.sponserwalletBalance;
        totalWithdrawnField = "totalSponserWithdrawn";
        transactionType = "withdrawal_approved_sponser_wallet";
        // No level or cumulative restrictions for sponser wallet
      }

      if (request.amount > currentBalance) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            message: `Insufficient available balance in user's ${request.walletType} wallet to approve this request.`,
          });
      }

      // Deduct balance from the correct wallet
      if (request.walletType === "main") {
        user.walletBalance -= request.amount;
      } else if (request.walletType === "sponser") {
        user.sponserwalletBalance -= request.amount;
      }

      // Update total withdrawn for the correct wallet
      user[totalWithdrawnField] += request.amount;

      // Create a WalletTransaction record
      const transactionId = uuidv4();
      const walletTxn = new WalletTransaction({
        user: user._id,
        amount: -request.amount,
        type: transactionType,
        status: "completed",
        description: `Withdrawal approved for ${request.walletType} wallet.`,
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
// This endpoint now takes an optional query parameter for walletType
exports.getWithdrawSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletType } = req.query; // Get walletType from query parameters

    let matchCondition = {
      user: new mongoose.Types.ObjectId(userId),
      status: "approved",
    };

    if (walletType && ["main", "sponser"].includes(walletType)) {
      matchCondition.walletType = walletType;
    } else {
      // Default to main if no valid walletType is provided for backward compatibility
      matchCondition.walletType = "main";
    }

    const result = await WithdrawRequest.aggregate([
      { $match: matchCondition },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const alreadyWithdrawn = result.length > 0 ? result[0].total : 0;

    res.json({ alreadyWithdrawn, walletType });
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
      .select("amount status createdAt walletType"); // Select relevant fields including walletType

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
// const mongoose = require("mongoose");
// const User = require("../models/User");
// const WithdrawRequest = require("../models/WithdrawRequest");

// // Optional: If you are tracking transactions, you can include this
// const WalletTransaction = require("../models/WalletTransaction");

// // Define MAX_WITHDRAWAL_PER_LEVEL as the *individual* limit for each level,
// // and we will sum them up dynamically.
// const INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL = {
//   1: 0,
//   2: 100,
//   3: 1000,
//   4: 6000,
//   5: 28000,
//   6: 120000,
//   7: 496000,
//   8: 2016000,
//   9: 8128000,
//   10: 32640000,
//   11: 130816000,
// };

// // Helper function to calculate cumulative max withdrawal
// function calculateCumulativeMaxWithdrawal(currentLevel) {
//   let cumulativeMax = 0;
//   for (let level = 1; level <= currentLevel; level++) {
//     cumulativeMax += INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL[level] || 0;
//   }
//   return cumulativeMax;
// }

// exports.WithdrawRequest = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { amount, bankDetails } = req.body;
//     console.log("Withdraw request body:", req.body);

//     // 🔒 Validate amount
//     if (!amount || typeof amount !== "number" || amount <= 0) {
//       return res.status(400).json({ message: "Invalid amount" });
//     }

//     // 📦 Fetch user
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 🚫 Check if user has upgraded
//     if (user.currentLevel < 1) { // Assuming level 1 allows no direct withdrawal, but sets the base
//       return res
//         .status(400)
//         .json({ message: "Please upgrade your account before withdrawing." });
//     }

//     // 💰 Calculate available balance
//     const availableBalance = user.walletBalance;

//     if (amount > availableBalance) {
//       return res
//         .status(400)
//         .json({ message: "Insufficient available balance in wallet." });
//     }

//     // 🧮 Calculate CUMULATIVE max withdrawal allowed for current level
//     const maxAllowedCumulative = calculateCumulativeMaxWithdrawal(user.currentLevel);

//     // 🧾 Sum total amount already withdrawn (approved requests only)
//     const totalWithdrawnResult = await WithdrawRequest.aggregate([
//       { $match: { user: user._id, status: "approved" } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     const alreadyWithdrawn =
//       totalWithdrawnResult.length > 0 ? totalWithdrawnResult[0].total : 0;

//     if (alreadyWithdrawn + amount > maxAllowedCumulative) {
//       const remainingLimit = Math.max(0, maxAllowedCumulative - alreadyWithdrawn);
//       return res.status(400).json({
//         message: `Withdrawal limit exceeded. Max cumulative allowed for your current level (Level ${user.currentLevel}) is ₹${maxAllowedCumulative}. You have already withdrawn ₹${alreadyWithdrawn}. Remaining limit: ₹${remainingLimit}.`,
//         alreadyWithdrawn,
//         remainingLimit,
//         maxAllowed: maxAllowedCumulative, // Use maxAllowed for cumulative
//       });
//     }

//     // --- Bank Details Saving Logic (Keep as is) ---
//     if (!user.bankDetails || !user.bankDetails.accountNumber) {
//       if (!bankDetails || !bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.phoneNumber) {
//         return res.status(400).json({ message: 'All bank details fields including phone number are required to submit a withdrawal request.' });
//       }
//       user.bankDetails = {
//         accountHolder: user.accountHolder,
//         accountNumber: bankDetails.accountNumber,
//         ifscCode: bankDetails.ifscCode,
//         bankName: bankDetails.bankName,
//         phoneNumber: user.phone,
//       };
//       await user.save();
//     }
//     // --- End Bank Details Saving Logic ---

//     // 🚫 Prevent multiple pending requests
//     const existing = await WithdrawRequest.findOne({
//       user: userId,
//       status: "pending",
//     });
//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "A withdrawal request is already pending. Please wait for it to be processed." });
//     }

//     // 📝 Create withdraw request
//     const withdrawRequest = new WithdrawRequest({
//       user: userId,
//       amount,
//       status: "pending",
//       createdAt: new Date(),
//     });

//     await withdrawRequest.save();

//     return res
//       .status(200)
//       .json({ message: "Withdraw request submitted successfully. It will be processed shortly." });
//   } catch (err) {
//     console.error("Withdraw error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.updateWithdrawStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!["approved", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const request = await WithdrawRequest.findById(id).populate("user");
//     if (!request)
//       return res.status(404).json({ message: "Withdraw request not found" });

//     if (request.status !== "pending") {
//       return res.status(400).json({ message: "Request is already processed" });
//     }

//     const user = request.user;

//     if (status === "approved") {
//       // 🚫 Must have upgraded
//       if (user.currentLevel < 1) {
//         return res
//           .status(400)
//           .json({
//             message: "User must upgrade to Level 1 before withdrawing.",
//           });
//       }

//       const availableBalance = user.walletBalance;
//       if (request.amount > availableBalance) {
//         return res
//           .status(400)
//           .json({ message: "Insufficient available balance in user's wallet to approve this request." });
//       }

//       // ✅ Calculate CUMULATIVE allowed limit for their current level
//       const userLevel = user.currentLevel;
//       const maxAllowedCumulative = calculateCumulativeMaxWithdrawal(userLevel);


//       // ✅ Sum of previously approved withdrawals
//       const totalWithdrawnResult = await WithdrawRequest.aggregate([
//         { $match: { user: user._id, status: "approved" } },
//         { $group: { _id: null, total: { $sum: "$amount" } } },
//       ]);

//       const alreadyWithdrawn =
//         totalWithdrawnResult.length > 0 ? totalWithdrawnResult[0].total : 0;
//       const remainingLimit = Math.max(0, maxAllowedCumulative - alreadyWithdrawn);

//       if (request.amount > remainingLimit) {
//         return res.status(400).json({
//           message: `Withdrawal not allowed. User has reached or exceeded the cumulative withdrawal limit for Level ${userLevel}. Max cumulative allowed: ₹${maxAllowedCumulative}, Already withdrawn: ₹${alreadyWithdrawn}, Request amount: ₹${request.amount}.`,
//           currentLevel: userLevel,
//           maxAllowed: maxAllowedCumulative, // Use maxAllowed for cumulative
//           alreadyWithdrawn,
//           remainingLimit,
//         });
//       }

//       // ✅ Deduct balance
//       user.walletBalance -= request.amount;
//       user.totalWithdrawn += request.amount; // Ensure totalWithdrawn is tracked on the user model

//       await user.save();
//     }

//     request.status = status;
//     await request.save();

//     return res
//       .status(200)
//       .json({ message: `Withdrawal request ${status} successfully.` });
//   } catch (err) {
//     console.error("Admin withdrawal update error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // GET /api/v1/withdraw/summary (No change needed here as it sums already withdrawn)
// exports.getWithdrawSummary = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const result = await WithdrawRequest.aggregate([
//       { $match: { user: new mongoose.Types.ObjectId(userId), status: "approved" } },
//       { $group: { _id: null, total: { $sum: "$amount" } } }
//     ]);

//     const alreadyWithdrawn = result.length > 0 ? result[0].total : 0;

//     res.json({ alreadyWithdrawn });
//   } catch (err) {
//     console.error("Withdraw summary error:", err);
//     res.status(500).json({ message: "Failed to get withdraw summary." });
//   }
// };

// // GET /api/v1/withdraw/my-requests
// // This function fetches all withdrawal requests for the authenticated user.
// exports.getMyWithdrawRequests = async (req, res) => {
//   try {
//     const userId = req.user.id; // Authenticated user's ID from middleware

//     // Find all withdrawal requests for this user, sorted by creation date (newest first)
//     const withdrawRequests = await WithdrawRequest.find({ user: userId })
//                                                 .sort({ createdAt: -1 }) // Sort by newest first
//                                                 .select('amount status createdAt'); // Select only relevant fields

//     if (!withdrawRequests || withdrawRequests.length === 0) {
//       return res.status(200).json({ message: "No withdrawal requests found for this user.", requests: [] });
//     }

//     return res.status(200).json({
//       message: "Withdrawal requests fetched successfully.",
//       requests: withdrawRequests,
//     });

//   } catch (err) {
//     console.error("Error fetching user's withdrawal requests:", err);
//     return res.status(500).json({ message: "Server error while fetching withdrawal requests." });
//   }
// };
