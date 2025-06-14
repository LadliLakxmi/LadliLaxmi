// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
// const User = require("../models/User");
// const Donation = require("../models/Donation");
// const WalletTransaction = require("../models/WalletTransaction");

// const LEVEL_FLOW = {
//   1: { amount: 300, uplineIncome: 600, upgradeCost: 500, netIncome: 100 },
//   2: { amount: 500, uplineIncome: 2000, upgradeCost: 1000, netIncome: 1000 },
//   3: { amount: 1000, uplineIncome: 8000, upgradeCost: 2000, netIncome: 6000 },
//   4: { amount: 2000, uplineIncome: 32000, upgradeCost: 4000, netIncome: 28000 },
//   5: { amount: 4000, uplineIncome: 128000, upgradeCost: 8000, netIncome: 120000 },
//   6: { amount: 8000, uplineIncome: 512000, upgradeCost: 16000, netIncome: 496000 },
//   7: { amount: 16000, uplineIncome: 2048000, upgradeCost: 32000, netIncome: 2016000 },
//   8: { amount: 32000, uplineIncome: 8192000, upgradeCost: 64000, netIncome: 8128000 },
//   9: { amount: 64000, uplineIncome: 32768000, upgradeCost: 128000, netIncome: 32640000 },
//   10: { amount: 128000, uplineIncome: 131072000, upgradeCost: 256000, netIncome: 130816000 },
//   11: { amount: 256000, uplineIncome: 524288000, upgradeCost: null, netIncome: 524288000 },
// };

// // exports.initiateUpgrade = async (req, res) => {
// //   const { userId, level } = req.body;
// //   console.log("Upgrade Request:", { userId, level });

// //   try {
// //     const user = await User.findById(userId);
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     const flow = LEVEL_FLOW[level];
// //     if (!flow) return res.status(400).json({ message: "Invalid level" });

// //     const amount = flow.amount;

// //     if (user.walletBalance < amount) {
// //       return res.status(400).json({
// //         message: "Insufficient balance",
// //         required: amount,
// //         current: user.walletBalance,
// //       });
// //     }

// //     if (user.blockedForUpgrade < amount) {
// //       return res.status(400).json({
// //         message: "Blocked amount is less than required upgrade cost",
// //         required: amount,
// //         blocked: user.blockedForUpgrade,
// //       });
// //     }

// //     const upline = await User.findOne({ referralCode: user.referredBy });
// //     if (!upline) return res.status(404).json({ message: "Upline not found" });

// //     const session = await mongoose.startSession();
// //     session.startTransaction();

// //     try {
// //       // Deduct upgrade cost from current user
// //       user.walletBalance -= amount;
// //       user.blockedForUpgrade -= amount;
// //       if (user.blockedForUpgrade < 0) user.blockedForUpgrade = 0;

// //       // Credit donation amount to upline's wallet
// //       upline.walletBalance += amount;

// //       // --- Smart blocking for next level upgrade ---
// //       const nextLevel = upline.currentLevel + 1;
// //       const nextFlow = LEVEL_FLOW[nextLevel];

// //       if (nextFlow) {
// //         const totalBlocked = (upline.blockedForUpgrade || 0) + amount;

// //         if (totalBlocked >= nextFlow.upgradeCost) {
// //           // Enough to block full upgrade
// //           upline.blockedForUpgrade = nextFlow.upgradeCost;

// //           // Extra amount is actual balance (available for withdraw)
// //           const available = totalBlocked - nextFlow.upgradeCost;
// //           upline.walletBalance = totalBlocked;

// //           console.log(
// //             `Blocked ₹${nextFlow.upgradeCost} for Level ${nextLevel} upgrade of ${upline.name}. Available: ₹${available}`
// //           );
// //         } else {
// //           // Still not enough → keep adding to blocked
// //           upline.blockedForUpgrade = totalBlocked;
// //           upline.walletBalance = 0;

// //           console.log(
// //             `Blocked ₹${totalBlocked} so far for Level ${nextLevel} upgrade of ${upline.name}`
// //           );
// //         }
// //       }

// //       // Create transactions
// //       const userTxn = new WalletTransaction({
// //         amount: -amount,
// //         type: "donation_sent",
// //         status: "completed",
// //         donationLevel: level,
// //         fromUser: user._id,
// //         toUser: upline._id,
// //         description: `Upgrade to Level ${level}`,
// //       });

// //       const uplineTxn = new WalletTransaction({
// //         amount: amount,
// //         type: "donation_received",
// //         status: "completed",
// //         donationLevel: level,
// //         fromUser: user._id,
// //         toUser: upline._id,
// //         description: `Received Level ${level} Upgrade Payment`,
// //       });

// //       await userTxn.save({ session });
// //       await uplineTxn.save({ session });

// //       // Record donation
// //       const donation = new Donation({
// //         donor: user._id,
// //         receiver: upline._id,
// //         amount,
// //         currentLevel: level,
// //         status: "completed",
// //         transactionId: uuidv4(),
// //       });

// //       await donation.save({ session });

// //       // Update user states
// //       user.walletTransactions.push(userTxn._id);
// //       user.donationsSent.push(donation._id);
// //       user.currentLevel = level;

// //       upline.walletTransactions.push(uplineTxn._id);
// //       upline.donationsReceived.push(donation._id);

// //       await user.save({ session });
// //       await upline.save({ session });

// //       await session.commitTransaction();
// //       session.endSession();

// //       return res.json({
// //         success: true,
// //         message: `Upgrade to Level ${level} successful`,
// //         newBalance: user.walletBalance,
// //         level: user.currentLevel,
// //       });
// //     } catch (err) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       console.error("Transaction error:", err);
// //       return res
// //         .status(500)
// //         .json({ message: "Transaction failed", error: err.message });
// //     }
// //   } catch (err) {
// //     console.error("Upgrade failed:", err);
// //     return res
// //       .status(500)
// //       .json({ message: "Upgrade failed", error: err.message });
// //   }
// // };

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

//     // NEW: Get UPLINE'S UPLINE (skip 1 level)
//     const uplineUpline = await User.findOne({ referralCode: upline.referredBy });
//     if (!uplineUpline) {
//       return res.status(404).json({ message: "Upline’s upline not found" });
//     }

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Deduct upgrade cost from current user
//       user.walletBalance -= amount;
//       user.blockedForUpgrade -= amount;
//       if (user.blockedForUpgrade < 0) user.blockedForUpgrade = 0;

//       // Credit amount to UPLINE’S UPLINE
//       uplineUpline.walletBalance += amount;

//       // --- Smart blocking for next upgrade ---
//       const nextLevel = uplineUpline.currentLevel + 1;
//       const nextFlow = LEVEL_FLOW[nextLevel];

//       if (nextFlow) {
//         const totalBlocked = (uplineUpline.blockedForUpgrade || 0) + amount;

//         if (totalBlocked >= nextFlow.upgradeCost) {
//           uplineUpline.blockedForUpgrade = nextFlow.upgradeCost;

//           // Extra amount can be withdrawn
//           const available = totalBlocked - nextFlow.upgradeCost;
//           uplineUpline.walletBalance = available;

//           console.log(
//             `Blocked ₹${nextFlow.upgradeCost} for Level ${nextLevel} upgrade of ${uplineUpline.name}. Available: ₹${available}`
//           );
//         } else {
//           uplineUpline.blockedForUpgrade = totalBlocked;
//           uplineUpline.walletBalance = 0;

//           console.log(
//             `Blocked ₹${totalBlocked} so far for Level ${nextLevel} upgrade of ${uplineUpline.name}`
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
//         toUser: uplineUpline._id,
//         description: `Upgrade to Level ${level}`,
//       });

//       const uplineTxn = new WalletTransaction({
//         amount: amount,
//         type: "donation_received",
//         status: "completed",
//         donationLevel: level,
//         fromUser: user._id,
//         toUser: uplineUpline._id,
//         description: `Received Level ${level} Upgrade Payment`,
//       });

//       await userTxn.save({ session });
//       await uplineTxn.save({ session });

//       // Record donation
//       const donation = new Donation({
//         donor: user._id,
//         receiver: uplineUpline._id,
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

//       uplineUpline.walletTransactions.push(uplineTxn._id);
//       uplineUpline.donationsReceived.push(donation._id);

//       await user.save({ session });
//       await uplineUpline.save({ session });

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

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Donation = require("../models/Donation"); // Assuming Donation model is relevant for upgrade payments
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


// Helper function to find an upline 'hops' levels above the current user
// This function takes the starting user's ID and traverses up the 'referredBy' chain
async function findSpecificUpline(starterUserId, hops, session) {
  let currentUser = await User.findById(starterUserId).session(session);

  if (!currentUser) {
    return null; // Starter user not found
  }

  let currentUpline = currentUser; // Start with the user whose upline we're looking for
  let hopsTaken = 0;

  // Traverse upwards until 'hops' are completed or no more sponsor is found
  while (currentUpline && currentUpline.referredBy && hopsTaken < hops) {
    // Populate the sponsor to get the next user object
    currentUpline = await User.findOne({ referralCode: currentUpline.referredBy }).session(session);
    if (!currentUpline) {
      // Should ideally not happen if  reference is valid
      return null;
    }
    hopsTaken++;
  }

  // If we took exactly 'hops' steps and landed on a user, that's our target upline.
  // Otherwise, we hit the top before finding the desired depth, so return null.
  return (currentUpline && hopsTaken === hops) ? currentUpline : null;
}


exports.initiateUpgrade = async (req, res) => {
  const { userId, level } = req.body; // 'level' here refers to the NEW level the user is upgrading TO
  console.log("Upgrade Request:", { userId, level });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure sequential level activation
    if (user.currentLevel + 1 !== level) {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot upgrade to Level ${level}. You must upgrade to Level ${user.currentLevel + 1} next.` });
    }

    const flow = LEVEL_FLOW[level]; // Get config for the NEW level
    if (!flow) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid or undefined level configuration." });
    }

    const upgradeCost = flow.amount; // The amount user needs to pay for this upgrade

    // Check if user is already at or above this target level
    if (user.currentLevel >= level) {
        await session.abortTransaction();
        return res.status(400).json({ message: `User is already at or above Level ${level}.` });
    }


    // 1. Validate Balance and Blocked Amount
    if (user.walletBalance < upgradeCost) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient wallet balance for upgrade.",
        required: upgradeCost,
        current: user.walletBalance,
      });
    }
    // 2. Determine the Recipient Upline for this upgrade
    let recipientUser = null;
    let paymentDestinationType = "Admin"; // Default to admin

    // The logic is:
    // If user is upgrading to Level 1 (from Level 0), they pay their direct upline (1 hop).
    // If user is upgrading to Level 2 (from Level 1), they pay their upline 1 level above. (1 hop)
    // If user is upgrading to Level 3 (from Level 2), they pay their upline 2 levels above. (2 hops)
    // This implies that the 'hops' parameter to `findSpecificUpline` should be `user.currentLevel` for the Nth level upline.
    // For level 1, it's 1 hop (user.currentLevel 0, next level 1).
    // For level 2, it's 1 hop (user.currentLevel 1, next level 2).
    // For level 3, it's 2 hops (user.currentLevel 2, next level 3).
    // The number of hops is `level - 1`.

    const hopsRequired = level ; // Example: upgrade to Level 1 -> 0 hops (direct upline payment), Level 2 -> 1 hop, Level 3 -> 2 hops.
                                   // This depends on how 'level' is defined in your problem statement.
                                   // "if user is at level 1 then its upgrade cost amount send to upline at one level 1  above" means 1 hop.
                                   // "if user is at level 2 then its  upgrade amount sent to upline user who is two level above" means 2 hops.
                                   // This suggests `hopsRequired = user.currentLevel`. Let's use that.

    // If user.currentLevel is 0 (new user), upgrade to Level 1, pay 0 hops (direct upline)
    // If user.currentLevel is 1, upgrade to Level 2, pay 1 hop (upline's upline)
    // If user.currentLevel is 2, upgrade to Level 3, pay 2 hops (upline's upline's upline)
    const hopsToUpline = user.currentLevel; // This determines how many "levels above" in the hierarchy.

    recipientUser = await findSpecificUpline(userId, hopsRequired, session);

    if (recipientUser) {
        paymentDestinationType = "upline";
    } else {
        // No upline found at the required depth, send to admin
        recipientUser = await User.findOne({ role: "Admin" }).session(session);
        if (!recipientUser) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Admin user not found. Critical error." });
        }
        paymentDestinationType = "admin";
    }

    // 3. Perform Wallet Deductions and Additions
    user.walletBalance -= upgradeCost;
    // If you're deducting from 'blockedForUpgrade', modify here:
    // user.blockedForUpgrade -= upgradeCost;
    // if (user.blockedForUpgrade < 0) user.blockedForUpgrade = 0;

    recipientUser.walletBalance += upgradeCost;


    // 4. Create Wallet Transactions
    const transactionId = uuidv4();

    // User's (sender) transaction
    const userTxn = new WalletTransaction({
      amount: -upgradeCost,
      type: "upgrade_payment_sent",
      status: "completed",
      toUser: recipientUser._id,
      description: `Upgrade to Level ${level} payment to ${paymentDestinationType === 'admin' ? 'Admin' : recipientUser.name || recipientUser.email}`,
      transactionId: transactionId,
      processedAt: new Date(),
    });
    await userTxn.save({ session });
    user.walletTransactions.push(userTxn._id);

    // Recipient's (upline/admin) transaction
    const recipientTxn = new WalletTransaction({
      amount: upgradeCost,
      type: paymentDestinationType === 'admin' ? "admin_upgrade_revenue" : "upline_upgrade_commission",
      status: "completed",
      fromUser: user._id,
      description: `Received Level ${level} upgrade payment from ${user.name || user.email}`,
      transactionId: transactionId,
      processedAt: new Date(),
    });
    await recipientTxn.save({ session });
    recipientUser.walletTransactions.push(recipientTxn._id);

    // 5. Record Donation (if you consider upgrade payments as 'donations')
    const donation = new Donation({
      donor: user._id,
      receiver: recipientUser._id,
      amount: upgradeCost,
      currentLevel: level, // This is the level for which the donation was made
      status: "completed",
      transactionId: uuidv4(), // Use a new UUID for the donation record itself
    });
    await donation.save({ session });
    user.donationsSent.push(donation._id);
    recipientUser.donationsReceived.push(donation._id);


    // 6. Update User's Level
    user.currentLevel = level; // Set the user's level to the newly upgraded level

    // 7. Save updated User documents
    await user.save({ session });
    await recipientUser.save({ session }); // Save the upline/admin as well

    // 8. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Upgrade to Level ${level} successful! Payment sent to ${paymentDestinationType === 'admin' ? 'Admin' : 'your upline'}.`,
      newBalance: user.walletBalance,
      level: user.currentLevel,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error during upgrade:", err);
    return res
      .status(500)
      .json({ message: "Upgrade transaction failed.", error: err.message });
  }
};
