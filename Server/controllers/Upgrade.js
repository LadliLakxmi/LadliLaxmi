const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Donation = require("../models/Donation");
const WalletTransaction = require("../models/WalletTransaction");

const LEVEL_FLOW = {
  1: { amount: 300, uplineIncome: 600, upgradeCost: 500, netIncome: 100 },
  2: { amount: 500, uplineIncome: 2000, upgradeCost: 1000, netIncome: 1000 },
  3: { amount: 1000, uplineIncome: 8000, upgradeCost: 2000, netIncome: 6000 },
  4: { amount: 2000, uplineIncome: 32000, upgradeCost: 4000, netIncome: 28000 },
  5: { amount: 4000, uplineIncome: 128000, upgradeCost: 8000, netIncome: 120000 },
  6: { amount: 8000, uplineIncome: 512000, upgradeCost: 16000, netIncome: 496000 },
  7: { amount: 16000, uplineIncome: 2048000, upgradeCost: 32000, netIncome: 2016000 },
  8: { amount: 32000, uplineIncome: 8192000, upgradeCost: 64000, netIncome: 8128000 },
  9: { amount: 64000, uplineIncome: 32768000, upgradeCost: 128000, netIncome: 32640000 },
  10: { amount: 128000, uplineIncome: 131072000, upgradeCost: 256000, netIncome: 130816000 },
  11: { amount: 256000, uplineIncome: 524288000, upgradeCost: null, netIncome: 524288000 },
};

// exports.initiateUpgrade = async (req, res) => {
//   const { userId, level } = req.body;
//   console.log("Upgrade Request:", { userId, level });

//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const flow = LEVEL_FLOW[level];
//     if (!flow) return res.status(400).json({ message: "Invalid level" });

//     const amount = flow.amount;

//     if (user.walletBalance < amount) {
//       return res.status(400).json({
//         message: "Insufficient balance",
//         required: amount,
//         current: user.walletBalance,
//       });
//     }

//     if (user.blockedForUpgrade < amount) {
//       return res.status(400).json({
//         message: "Blocked amount is less than required upgrade cost",
//         required: amount,
//         blocked: user.blockedForUpgrade,
//       });
//     }

//     const upline = await User.findOne({ referralCode: user.referredBy });
//     if (!upline) return res.status(404).json({ message: "Upline not found" });

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Deduct upgrade cost from current user
//       user.walletBalance -= amount;
//       user.blockedForUpgrade -= amount;
//       if (user.blockedForUpgrade < 0) user.blockedForUpgrade = 0;

//       // Credit donation amount to upline's wallet
//       upline.walletBalance += amount;

//       // --- Smart blocking for next level upgrade ---
//       const nextLevel = upline.currentLevel + 1;
//       const nextFlow = LEVEL_FLOW[nextLevel];

//       if (nextFlow) {
//         const totalBlocked = (upline.blockedForUpgrade || 0) + amount;

//         if (totalBlocked >= nextFlow.upgradeCost) {
//           // Enough to block full upgrade
//           upline.blockedForUpgrade = nextFlow.upgradeCost;

//           // Extra amount is actual balance (available for withdraw)
//           const available = totalBlocked - nextFlow.upgradeCost;
//           upline.walletBalance = totalBlocked;

//           console.log(
//             `Blocked ₹${nextFlow.upgradeCost} for Level ${nextLevel} upgrade of ${upline.name}. Available: ₹${available}`
//           );
//         } else {
//           // Still not enough → keep adding to blocked
//           upline.blockedForUpgrade = totalBlocked;
//           upline.walletBalance = 0;

//           console.log(
//             `Blocked ₹${totalBlocked} so far for Level ${nextLevel} upgrade of ${upline.name}`
//           );
//         }
//       }

//       // Create transactions
//       const userTxn = new WalletTransaction({
//         amount: -amount,
//         type: "donation_sent",
//         status: "completed",
//         donationLevel: level,
//         fromUser: user._id,
//         toUser: upline._id,
//         description: `Upgrade to Level ${level}`,
//       });

//       const uplineTxn = new WalletTransaction({
//         amount: amount,
//         type: "donation_received",
//         status: "completed",
//         donationLevel: level,
//         fromUser: user._id,
//         toUser: upline._id,
//         description: `Received Level ${level} Upgrade Payment`,
//       });

//       await userTxn.save({ session });
//       await uplineTxn.save({ session });

//       // Record donation
//       const donation = new Donation({
//         donor: user._id,
//         receiver: upline._id,
//         amount,
//         currentLevel: level,
//         status: "completed",
//         transactionId: uuidv4(),
//       });

//       await donation.save({ session });

//       // Update user states
//       user.walletTransactions.push(userTxn._id);
//       user.donationsSent.push(donation._id);
//       user.currentLevel = level;

//       upline.walletTransactions.push(uplineTxn._id);
//       upline.donationsReceived.push(donation._id);

//       await user.save({ session });
//       await upline.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.json({
//         success: true,
//         message: `Upgrade to Level ${level} successful`,
//         newBalance: user.walletBalance,
//         level: user.currentLevel,
//       });
//     } catch (err) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error("Transaction error:", err);
//       return res
//         .status(500)
//         .json({ message: "Transaction failed", error: err.message });
//     }
//   } catch (err) {
//     console.error("Upgrade failed:", err);
//     return res
//       .status(500)
//       .json({ message: "Upgrade failed", error: err.message });
//   }
// };

exports.initiateUpgrade = async (req, res) => {
  const { userId, level } = req.body;
  console.log("Upgrade Request:", { userId, level });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const flow = LEVEL_FLOW[level];
    if (!flow) return res.status(400).json({ message: "Invalid level" });

    const amount = flow.amount;

    if (user.walletBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        required: amount,
        current: user.walletBalance,
      });
    }

    if (user.blockedForUpgrade < amount) {
      return res.status(400).json({
        message: "Blocked amount is less than required upgrade cost",
        required: amount,
        blocked: user.blockedForUpgrade,
      });
    }

    const upline = await User.findOne({ referralCode: user.referredBy });
    if (!upline) return res.status(404).json({ message: "Upline not found" });

    // NEW: Get UPLINE'S UPLINE (skip 1 level)
    const uplineUpline = await User.findOne({ referralCode: upline.referredBy });
    if (!uplineUpline) {
      return res.status(404).json({ message: "Upline’s upline not found" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct upgrade cost from current user
      user.walletBalance -= amount;
      user.blockedForUpgrade -= amount;
      if (user.blockedForUpgrade < 0) user.blockedForUpgrade = 0;

      // Credit amount to UPLINE’S UPLINE
      uplineUpline.walletBalance += amount;

      // --- Smart blocking for next upgrade ---
      const nextLevel = uplineUpline.currentLevel + 1;
      const nextFlow = LEVEL_FLOW[nextLevel];

      if (nextFlow) {
        const totalBlocked = (uplineUpline.blockedForUpgrade || 0) + amount;

        if (totalBlocked >= nextFlow.upgradeCost) {
          uplineUpline.blockedForUpgrade = nextFlow.upgradeCost;

          // Extra amount can be withdrawn
          const available = totalBlocked - nextFlow.upgradeCost;
          uplineUpline.walletBalance = available;

          console.log(
            `Blocked ₹${nextFlow.upgradeCost} for Level ${nextLevel} upgrade of ${uplineUpline.name}. Available: ₹${available}`
          );
        } else {
          uplineUpline.blockedForUpgrade = totalBlocked;
          uplineUpline.walletBalance = 0;

          console.log(
            `Blocked ₹${totalBlocked} so far for Level ${nextLevel} upgrade of ${uplineUpline.name}`
          );
        }
      }

      // Create transactions
      const userTxn = new WalletTransaction({
        amount: -amount,
        type: "donation_sent",
        status: "completed",
        donationLevel: level,
        fromUser: user._id,
        toUser: uplineUpline._id,
        description: `Upgrade to Level ${level}`,
      });

      const uplineTxn = new WalletTransaction({
        amount: amount,
        type: "donation_received",
        status: "completed",
        donationLevel: level,
        fromUser: user._id,
        toUser: uplineUpline._id,
        description: `Received Level ${level} Upgrade Payment`,
      });

      await userTxn.save({ session });
      await uplineTxn.save({ session });

      // Record donation
      const donation = new Donation({
        donor: user._id,
        receiver: uplineUpline._id,
        amount,
        currentLevel: level,
        status: "completed",
        transactionId: uuidv4(),
      });

      await donation.save({ session });

      // Update user states
      user.walletTransactions.push(userTxn._id);
      user.donationsSent.push(donation._id);
      user.currentLevel = level;

      uplineUpline.walletTransactions.push(uplineTxn._id);
      uplineUpline.donationsReceived.push(donation._id);

      await user.save({ session });
      await uplineUpline.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        success: true,
        message: `Upgrade to Level ${level} successful`,
        newBalance: user.walletBalance,
        level: user.currentLevel,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction error:", err);
      return res
        .status(500)
        .json({ message: "Transaction failed", error: err.message });
    }
  } catch (err) {
    console.error("Upgrade failed:", err);
    return res
      .status(500)
      .json({ message: "Upgrade failed", error: err.message });
  }
};
