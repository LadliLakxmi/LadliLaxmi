const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Donation = require("../models/Donation");
const WalletTransaction = require("../models/WalletTransaction");
const { findMatrixSlot } = require("../utils/matrix");

const LEVEL_FLOW = {
  1: {
    amount: 300,
    uplineIncome: 600,
    upgradeCost: 500,
    sponsorShare: 100,
    netIncome: 100,
  },
  2: {
    amount: 500,
    uplineIncome: 2000,
    upgradeCost: 1000,
    sponsorShare: 0,
    netIncome: 1000,
  },
  3: {
    amount: 1000,
    uplineIncome: 8000,
    upgradeCost: 2000,
    sponsorShare: 0,
    netIncome: 6000,
  },
  4: {
    amount: 2000,
    uplineIncome: 32000,
    upgradeCost: 4000,
    sponsorShare: 0,
    netIncome: 28000,
  },
  5: {
    amount: 4000,
    uplineIncome: 128000,
    upgradeCost: 8000,
    sponsorShare: 0,
    netIncome: 120000,
  },
  6: {
    amount: 8000,
    uplineIncome: 512000,
    upgradeCost: 16000,
    sponsorShare: 0,
    netIncome: 496000,
  },
  7: {
    amount: 16000,
    uplineIncome: 2048000,
    upgradeCost: 32000,
    sponsorShare: 0,
    netIncome: 2016000,
  },
  8: {
    amount: 32000,
    uplineIncome: 8192000,
    upgradeCost: 64000,
    sponsorShare: 0,
    netIncome: 8128000,
  },
  9: {
    amount: 64000,
    uplineIncome: 32768000,
    upgradeCost: 128000,
    sponsorShare: 0,
    netIncome: 32640000,
  },
  10: {
    amount: 128000,
    uplineIncome: 131072000,
    upgradeCost: 256000,
    sponsorShare: 0,
    netIncome: 130816000,
  },
  11: {
    amount: 256000,
    uplineIncome: 524288000,
    upgradeCost: null,
    sponsorShare: 0,
    netIncome: 524288000,
  },
};

// Helper function to find upline (optimized and fixed)
async function findSpecificUpline(starterUserId, hops, session) {
  if (hops === 0) return await User.findById(starterUserId).session(session);

  let currentUser = await User.findById(starterUserId).session(session);
  console.log("currebt user in findSpecificUpline: ",currentUser)
  if (!currentUser) return null;

  // Traverse up the referral chain
  for (let i = 0; i < hops; i++) {
    if (!currentUser.referredBy) return null;
    currentUser = await User.findOne({
      referralCode: currentUser.referredBy,
    }).session(session);
      console.log("current user inside loop findSpecificUpline: ",currentUser)
    if (!currentUser) return null;
  }
  return currentUser;
}

exports.initiateUpgrade = async (req, res) => {
  const { userId, level } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found." });
    }

    // Validate level sequence
    if (user.currentLevel + 1 !== level) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Invalid upgrade sequence. Current level: ${
          user.currentLevel
        }, next required: ${user.currentLevel + 1}`,
      });
    }

    const flow = LEVEL_FLOW[level];
    if (!flow) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid level configuration." });
    }

    // Calculate total required amount
    const totalRequired = flow.amount + (level === 1 ? flow.sponsorShare : 0);
    if (user.upgradewalletBalance < totalRequired) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient wallet balance",
        required: totalRequired,
        current: user.upgradewalletBalance,
      });
    }

    // --- NEW LOGIC: Add user to matrix when activating Level 1 ---
    let slotUser = null;
    let actualUplineReferralCode = null;
    let sponsorDuringRegistration = null;
    if (level === 1) {
      // Find the user who sponsored (referred) this new user during registration
      sponsorDuringRegistration = await User.findOne({
        referralCode: user.sponserdBy,
      }).session(session);
      if (
        !sponsorDuringRegistration ||
        sponsorDuringRegistration.currentLevel === 0
      ) {
        // Fallback to admin if sponsor not found (e.g., initial admin placement)
        sponsorDuringRegistration = await User.findOne({
          referralCode: "R7079AEU",
        }).session(session);
        // here chnage admin with company referral code
        if (!sponsorDuringRegistration) {
          await session.abortTransaction();
          return res
          .status(500)
          .json({ message: "Company account not found for matrix placement." });
        }
      }
      
      // Find an available slot under the sponsor (or admin if no specific sponsor)
      slotUser = await findMatrixSlot(sponsorDuringRegistration._id, session); // Pass session to findMatrixSlot
      if (!slotUser) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `No available matrix slot found under ${sponsorDuringRegistration.name} (${sponsorDuringRegistration.referralCode}).`,
        });
      }
      // Assign the current user to the found slot
      user.referredBy = slotUser.referralCode; // Set the actual matrix upline
      slotUser.matrixChildren.push(user._id);
      await slotUser.save({ session });
      // user.save({ session }); // Will be saved at the end of the transaction

      // Add new user to the directReferrals of the original sponsor (whoever invited them)
      if (sponsorDuringRegistration) {
        sponsorDuringRegistration.directReferrals.push(user._id);
        await sponsorDuringRegistration.save({ session });
      }
      actualUplineReferralCode = slotUser.referralCode; // This will be the direct matrix upline
    }

    // Find recipient for upgrade payment
    const hopsRequired = level; // Corrected hops calculation
    let recipientUser = await findSpecificUpline(userId, hopsRequired, session);
    console.log("recepient user: ",recipientUser)
    let paymentDestinationType = "admin";

    if (recipientUser) {
      paymentDestinationType = "upline";
    } else {
      recipientUser = await User.findOne({ role: "Admin" }).session(session);
      if (!recipientUser) {
        await session.abortTransaction();
        return res.status(500).json({ message: "Company account not found." });
      }
    }

    // Handle sponsor payment (only for level 1)
    let sponsorUser = null;
    if (level === 1) {
      sponsorUser = await User.findOne({
        referralCode: user.sponserdBy,
      }).session(session);
      if (!sponsorUser) {
        sponsorUser = await User.findOne({  referralCode: "R7079AEU" }).session(session);
        if (!sponsorUser) {
          await session.abortTransaction();
          return res
            .status(500)
            .json({ message: "Company account not found for sponsor payment." });
        }
      }
    }

    // Declare transaction variables at a higher scope
    let userTxn, recipientTxn, sponsorTxn;
    let combinedTxnId;
    // Create donation record placeholder (will be populated and saved later)
    let donation;
   // Define the next level for the recipient to check their upgrade cost
    const recipientNextLevel = recipientUser.currentLevel;
    const recipientNextLevelFlow = LEVEL_FLOW[recipientNextLevel];
    // If recipientNextLevelFlow is undefined (e.g., recipient is already at max level), upgradeCost is 0
    const recipientNextUpgradeCost = recipientNextLevelFlow
      ? recipientNextLevelFlow.upgradeCost || 0 // Use || 0 if upgradeCost can be null for the last level
      : 0;



    // Handle combined payment for Level 1 if recipient and sponsor are the same
    if (
      level === 1 &&
      recipientUser &&
      sponsorUser &&
      recipientUser._id.equals(sponsorUser._id)
    ) {
      console.log("sponsorUser.walletBalance: ", recipientUser.walletBalance);
      const combinedAmount = flow.amount + flow.sponsorShare;

      // Deduct combined amount from user's wallet
      user.upgradewalletBalance -= combinedAmount;
 if (
        recipientUser.upgradewalletBalance >=
          recipientNextUpgradeCost &&
        recipientNextUpgradeCost > 0
      ) {
        // If condition fulfilled, add current combinedAmount directly to main wallet
        recipientUser.walletBalance += combinedAmount;
        console.log(
          `Recipient ${recipientUser.email} (Combined) - Condition met. Added ${combinedAmount} directly to main wallet.`
        );
      } else {
        // Otherwise, add to upgrade wallet
        recipientUser.upgradewalletBalance += combinedAmount;
        console.log(
          `Recipient ${recipientUser.email} (Combined) - Condition not met. Added ${combinedAmount} to upgrade wallet. Current upgrade balance: ${recipientUser.upgradewalletBalance}`
        );
      }
      // Create a single wallet transaction for the shared recipient/sponsor
      combinedTxnId = uuidv4();
      userTxn = new WalletTransaction({ // Assign to already declared variable
        amount: -combinedAmount,
        type: "upgrade_payment_sent_and_sponsor_share_sent",
        status: "completed",
        toUser: recipientUser._id,
        fromUser:user._id,
        description: `Combined payment for Level ${level} upgrade and sponsor share`,
        transactionId: combinedTxnId,
        processedAt: new Date(),
      });
      await userTxn.save({ session });

      recipientTxn = new WalletTransaction({ // Assign to already declared variable
        amount: combinedAmount,
        type:
          recipientUser.role === "Admin"
            ? "admin_combined_upgrade_revenue_and_sponsor_share"
            : "upline_combined_upgrade_commission_and_sponsor_commission",
        status: "completed",
        fromUser: user._id,
        description: `Combined Level ${level} payment and sponsor share from ${user.email}`,
        transactionId: combinedTxnId,
        processedAt: new Date(),
      });
      await recipientTxn.save({ session });
      
      // Assign donation here as well, since it's a combined payment
      donation = new Donation({
        donor: user._id,
        receiver: recipientUser._id,
        amount: combinedAmount, // The combined amount is the "donation" in this case
        currentLevel: level,
        status: "completed",
        transactionId: combinedTxnId, // Use the same transaction ID
      });
      await donation.save({ session });
      
      user.donationsSent.push(donation._id);
      recipientUser.donationsReceived.push(donation._id); // This was missing for the combined scenario

      user.walletTransactions.push(userTxn._id);
      recipientUser.walletTransactions.push(recipientTxn._id);

    } else {
      // --- Existing logic for separate payments ---

      // Deduct upgrade payment from user's wallet
      user.upgradewalletBalance -= flow.amount;
   // Check if current upgradewalletBalance + incoming flow.amount is enough for next upgrade
      if (
        recipientUser.upgradewalletBalance >=
          recipientNextUpgradeCost &&
        recipientNextUpgradeCost > 0
      ) {
        // If condition fulfilled, add current flow.amount directly to main wallet
        recipientUser.walletBalance += flow.amount;
        console.log(
          `Recipient ${recipientUser.email} - Condition met. Added ${flow.amount} directly to main wallet.`
        );
      } else {
        // Otherwise, add to upgrade wallet
        recipientUser.upgradewalletBalance += flow.amount;
        console.log(
          `Recipient ${recipientUser.email} - Condition not met. Added ${flow.amount} to upgrade wallet. Current upgrade balance: ${recipientUser.upgradewalletBalance}`
        );
      }

      // Create separate transaction records for upgrade payment
      const txnId = uuidv4(); // Unique for this upgrade part
      userTxn = new WalletTransaction({ // Assign to already declared variable
        amount: -flow.amount,
        type: "upgrade_payment_sent",
        status: "completed",
        toUser: recipientUser._id,
        fromUser:user._id,
        description: `Upgrade to Level ${level} payment`,
        transactionId: txnId,
        processedAt: new Date(),
      });
      await userTxn.save({ session });

      recipientTxn = new WalletTransaction({ // Assign to already declared variable
        amount: flow.amount,
        type:
          paymentDestinationType === "admin"
            ? "admin_upgrade_revenue"
            : "upline_upgrade_commission",
        status: "completed",
        fromUser: user._id,
        toUser:recipientUser._id,
        description: `Level ${level} upgrade from ${user.email}`,
        transactionId: txnId,
        processedAt: new Date(),
      });
      await recipientTxn.save({ session });

      user.walletTransactions.push(userTxn._id);
      recipientUser.walletTransactions.push(recipientTxn._id);

      // Create donation record for the upgrade amount
      donation = new Donation({
        donor: user._id,
        receiver: recipientUser._id,
        amount: flow.amount,
        currentLevel: level,
        status: "completed",
        transactionId: txnId, // Use the same transaction ID as the upgrade payment
      });
      await donation.save({ session });
      
      user.donationsSent.push(donation._id);
      recipientUser.donationsReceived.push(donation._id);

      // Handle sponsor payment (level 1 only) if different from recipient
      if (level === 1) { // This block is ONLY if recipientUser and sponsorUser are DIFFERENT
        user.upgradewalletBalance -= flow.sponsorShare;
        sponsorUser.walletBalance += flow.sponsorShare;
           const txnId = uuidv4(); 
        sponsorTxn = new WalletTransaction({ // Assign to already declared variable
          amount: flow.sponsorShare,
          type:
            sponsorUser.role === "Admin"
              ? "admin_sponsor_share"
              : "sponsor_commission",
          status: "completed",
          fromUser: user._id,
          toUser:sponsorUser._id,
          description: `Level ${level} sponsor commission`,
          transactionId: txnId, // New unique transaction ID for sponsor share
          processedAt: new Date(),
        });
        await sponsorTxn.save({ session });
        sponsorUser.walletTransactions.push(sponsorTxn._id);
          // Create donation record for the upgrade amount
      donation = new Donation({
        donor: user._id,
        receiver: sponsorUser._id,
        amount: flow.sponsorShare,
        currentLevel: level,
        status: "completed",
        transactionId: txnId, // Use the same transaction ID as the upgrade payment
      });
      await donation.save({ session });
      
      user.donationsSent.push(donation._id);
      sponsorUser.donationsReceived.push(donation._id);
        await sponsorUser.save({ session }); // Save sponsorUser changes here
      }
    }
    
    // Update user level and save
    user.currentLevel = level;
    // The walletTransactions pushes are now handled inside the if/else blocks for clarity and correctness.
    // If you need to push sponsorTxn._id here, ensure sponsorTxn is defined for all paths.
    // For now, it's only pushed within the level === 1 block where it's created.
    
    // Save all changes
    await user.save({ session });
    await recipientUser.save({ session });
    // sponsorUser is saved inside its block if applicable
    await session.commitTransaction();

    return res.json({
      success: true,
      message: `Successfully upgraded to Level ${level}`,
      newUpgradeWalletBalance: user.upgradewalletBalance, // This will be 0 for the upgrading user, but useful for context
      recipientUpgradeWalletBalance: recipientUser.upgradewalletBalance, // Show recipient's upgrade wallet balance
      recipientMainWalletBalance: recipientUser.walletBalance, // Show recipient's main wallet balance after transfer if any
      newBalance: user.walletBalance,
      newLevel: user.currentLevel,
      matrixPlacement:
        level === 1 ? `Placed under: ${actualUplineReferralCode}` : undefined,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Upgrade Error:", err);
    return res.status(500).json({
      message: "Upgrade failed",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};
// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
// const User = require("../models/User");
// const Donation = require("../models/Donation");
// const WalletTransaction = require("../models/WalletTransaction");
// const { findMatrixSlot } = require("../utils/matrix");

// const LEVEL_FLOW = {
//   1: {
//     amount: 300,
//     uplineIncome: 600,
//     upgradeCost: 500,
//     sponsorShare: 100,
//     netIncome: 100,
//   },
//   2: {
//     amount: 500,
//     uplineIncome: 2000,
//     upgradeCost: 1000,
//     sponsorShare: 0,
//     netIncome: 1000,
//   },
//   3: {
//     amount: 1000,
//     uplineIncome: 8000,
//     upgradeCost: 2000,
//     sponsorShare: 0,
//     netIncome: 6000,
//   },
//   4: {
//     amount: 2000,
//     uplineIncome: 32000,
//     upgradeCost: 4000,
//     sponsorShare: 0,
//     netIncome: 28000,
//   },
//   5: {
//     amount: 4000,
//     uplineIncome: 128000,
//     upgradeCost: 8000,
//     sponsorShare: 0,
//     netIncome: 120000,
//   },
//   6: {
//     amount: 8000,
//     uplineIncome: 512000,
//     upgradeCost: 16000,
//     sponsorShare: 0,
//     netIncome: 496000,
//   },
//   7: {
//     amount: 16000,
//     uplineIncome: 2048000,
//     upgradeCost: 32000,
//     sponsorShare: 0,
//     netIncome: 2016000,
//   },
//   8: {
//     amount: 32000,
//     uplineIncome: 8192000,
//     upgradeCost: 64000,
//     sponsorShare: 0,
//     netIncome: 8128000,
//   },
//   9: {
//     amount: 64000,
//     uplineIncome: 32768000,
//     upgradeCost: 128000,
//     sponsorShare: 0,
//     netIncome: 32640000,
//   },
//   10: {
//     amount: 128000,
//     uplineIncome: 131072000,
//     upgradeCost: 256000,
//     sponsorShare: 0,
//     netIncome: 130816000,
//   },
//   11: {
//     amount: 256000,
//     uplineIncome: 524288000,
//     upgradeCost: null,
//     sponsorShare: 0,
//     netIncome: 524288000,
//   },
// };

// // Helper function to find upline (optimized and fixed)
// async function findSpecificUpline(starterUserId, hops, session) {
//   if (hops === 0) return await User.findById(starterUserId).session(session);

//   let currentUser = await User.findById(starterUserId).session(session);
//   if (!currentUser) return null;

//   // Traverse up the referral chain
//   for (let i = 0; i < hops; i++) {
//     if (!currentUser.referredBy) return null;
//     currentUser = await User.findOne({
//       referralCode: currentUser.referredBy,
//     }).session(session);
//     if (!currentUser) return null;
//   }
//   return currentUser;
// }

// exports.initiateUpgrade = async (req, res) => {
//   const { userId, level } = req.body;
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const user = await User.findById(userId).session(session);
//     if (!user) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Validate level sequence
//     if (user.currentLevel + 1 !== level) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         message: `Invalid upgrade sequence. Current level: ${
//           user.currentLevel
//         }, next required: ${user.currentLevel + 1}`,
//       });
//     }

//     const flow = LEVEL_FLOW[level];
//     if (!flow) {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Invalid level configuration." });
//     }

//     // Calculate total required amount
//     const totalRequired = flow.amount + (level === 1 ? flow.sponsorShare : 0);
//     if (user.walletBalance < totalRequired) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         message: "Insufficient wallet balance",
//         required: totalRequired,
//         current: user.walletBalance,
//       });
//     }

//     // --- NEW LOGIC: Add user to matrix when activating Level 1 ---
//     let slotUser = null;
//     let actualUplineReferralCode = null;
//     let sponsorDuringRegistration = null;
//     if (level === 1) {
//       // Find the user who sponsored (referred) this new user during registration
//       sponsorDuringRegistration = await User.findOne({
//         referralCode: user.sponserdBy,
//       }).session(session);
//       console.log("before sponsorDuringRegistration",sponsorDuringRegistration)
//       if (
//         !sponsorDuringRegistration ||
//         sponsorDuringRegistration.currentLevel === 0
//       ) {
//         // Fallback to admin if sponsor not found (e.g., initial admin placement)
//         sponsorDuringRegistration = await User.findOne({
//           referralCode: "R7079AEU",
//         }).session(session);
//         // here chnage admin with company referral code
//         if (!sponsorDuringRegistration) {
//           await session.abortTransaction();
//           return res
//           .status(500)
//           .json({ message: "Company account not found for matrix placement." });
//         }
//       }
//       console.log("After sponsorDuringRegistration",sponsorDuringRegistration)
      
//       // Find an available slot under the sponsor (or admin if no specific sponsor)
//       slotUser = await findMatrixSlot(sponsorDuringRegistration._id, session); // Pass session to findMatrixSlot
//       if (!slotUser) {
//         await session.abortTransaction();
//         return res.status(400).json({
//           success: false,
//           message: `No available matrix slot found under ${sponsorDuringRegistration.name} (${sponsorDuringRegistration.referralCode}).`,
//         });
//       }
//       // Assign the current user to the found slot
//       user.referredBy = slotUser.referralCode; // Set the actual matrix upline
//       slotUser.matrixChildren.push(user._id);
//       await slotUser.save({ session });
//       // user.save({ session }); // Will be saved at the end of the transaction

//       // Add new user to the directReferrals of the original sponsor (whoever invited them)
//       if (sponsorDuringRegistration) {
//         sponsorDuringRegistration.directReferrals.push(user._id);
//         await sponsorDuringRegistration.save({ session });
//       }
//       actualUplineReferralCode = slotUser.referralCode; // This will be the direct matrix upline
//     }

//     // Find recipient for upgrade payment
//     const hopsRequired = level; // Corrected hops calculation
//     let recipientUser = await findSpecificUpline(userId, hopsRequired, session);
//     console.log("recepient user: ",recipientUser)
//     let paymentDestinationType = "admin";

//     if (recipientUser) {
//       paymentDestinationType = "upline";
//     } else {
//       recipientUser = await User.findOne({ role: "Admin" }).session(session);
//       if (!recipientUser) {
//         await session.abortTransaction();
//         return res.status(500).json({ message: "Admin account not found." });
//       }
//     }

//     // Handle sponsor payment (only for level 1)
//     let sponsorUser = null;
//     if (level === 1) {
//       sponsorUser = await User.findOne({
//         referralCode: user.sponserdBy,
//       }).session(session);
//       if (!sponsorUser) {
//         sponsorUser = await User.findOne({  referralCode: "R7079AEU" }).session(session);
//         if (!sponsorUser) {
//           await session.abortTransaction();
//           return res
//             .status(500)
//             .json({ message: "Company account not found for sponsor payment." });
//         }
//       }
//     }

//     // Declare transaction variables at a higher scope
//     let userTxn, recipientTxn, sponsorTxn;
//     let combinedTxnId;

//     // Create donation record placeholder (will be populated and saved later)
//     let donation;

//     // Handle combined payment for Level 1 if recipient and sponsor are the same
//     if (
//       level === 1 &&
//       recipientUser &&
//       sponsorUser &&
//       recipientUser._id.equals(sponsorUser._id)
//     ) {
//       console.log("sponsorUser.walletBalance: ", recipientUser.walletBalance);
//       const combinedAmount = flow.amount + flow.sponsorShare;

//       // Deduct combined amount from user's wallet
//       user.walletBalance -= combinedAmount;
//       // Add combined amount to the shared recipient/sponsor's wallet
//       recipientUser.walletBalance += combinedAmount; // recipientUser is the same as sponsorUser here

//       console.log("sponsorUser.walletBalance: ", recipientUser.walletBalance);
//       // Create a single wallet transaction for the shared recipient/sponsor
//       combinedTxnId = uuidv4();
//       userTxn = new WalletTransaction({ // Assign to already declared variable
//         amount: -combinedAmount,
//         type: "upgrade_payment_sent_and_sponsor_share_sent",
//         status: "completed",
//         toUser: recipientUser._id,
//                 fromUser:user._id,
//         description: `Combined payment for Level ${level} upgrade and sponsor share`,
//         transactionId: combinedTxnId,
//         processedAt: new Date(),
//       });
//       await userTxn.save({ session });

//       recipientTxn = new WalletTransaction({ // Assign to already declared variable
//         amount: combinedAmount,
//         type:
//           recipientUser.role === "Admin"
//             ? "admin_combined_upgrade_revenue_and_sponsor_share"
//             : "upline_combined_upgrade_commission_and_sponsor_commission",
//         status: "completed",
//         fromUser: user._id,
//         toUser:recipientUser._id,
//         description: `Combined Level ${level} payment and sponsor share from ${user.email}`,
//         transactionId: combinedTxnId,
//         processedAt: new Date(),
//       });
//       await recipientTxn.save({ session });
      
//       // Assign donation here as well, since it's a combined payment
//       donation = new Donation({
//         donor: user._id,
//         receiver: recipientUser._id,
//         amount: combinedAmount, // The combined amount is the "donation" in this case
//         currentLevel: level,
//         status: "completed",
//         transactionId: combinedTxnId, // Use the same transaction ID
//       });
//       await donation.save({ session });
      
//       user.donationsSent.push(donation._id);
//       recipientUser.donationsReceived.push(donation._id); // This was missing for the combined scenario

//       user.walletTransactions.push(userTxn._id);
//       recipientUser.walletTransactions.push(recipientTxn._id);

//     } else {
//       // --- Existing logic for separate payments ---

//       // Deduct upgrade payment from user's wallet
//       user.walletBalance -= flow.amount;
//       // Add upgrade payment to recipientUser's wallet
//       recipientUser.walletBalance += flow.amount;

//       // Create separate transaction records for upgrade payment
//       const txnId = uuidv4(); // Unique for this upgrade part
//       userTxn = new WalletTransaction({ // Assign to already declared variable
//         amount: -flow.amount,
//         type: "upgrade_payment_sent",
//         status: "completed",
//         toUser: recipientUser._id,
//                fromUser:user._id,
//         description: `Upgrade to Level ${level} payment`,
//         transactionId: txnId,
//         processedAt: new Date(),
//       });
//       await userTxn.save({ session });

//       recipientTxn = new WalletTransaction({ // Assign to already declared variable
//         amount: flow.amount,
//         type:
//           paymentDestinationType === "admin"
//             ? "admin_upgrade_revenue"
//             : "upline_upgrade_commission",
//         status: "completed",
//         fromUser: user._id,
//         description: `Level ${level} upgrade from ${user.email}`,
//         transactionId: txnId,
//         processedAt: new Date(),
//       });
//       await recipientTxn.save({ session });

//       user.walletTransactions.push(userTxn._id);
//       recipientUser.walletTransactions.push(recipientTxn._id);

//       // Create donation record for the upgrade amount
//       donation = new Donation({
//         donor: user._id,
//         receiver: recipientUser._id,
//         amount: flow.amount,
//         currentLevel: level,
//         status: "completed",
//         transactionId: txnId, // Use the same transaction ID as the upgrade payment
//       });
//       await donation.save({ session });
      
//       user.donationsSent.push(donation._id);
//       recipientUser.donationsReceived.push(donation._id);

//       // Handle sponsor payment (level 1 only) if different from recipient
//       if (level === 1) { // This block is ONLY if recipientUser and sponsorUser are DIFFERENT
//         user.walletBalance -= flow.sponsorShare;
//         sponsorUser.walletBalance += flow.sponsorShare;
// const txnId = uuidv4(); 
//         sponsorTxn = new WalletTransaction({ // Assign to already declared variable
//           amount: flow.sponsorShare,
//           type:
//             sponsorUser.role === "Admin"
//               ? "admin_sponsor_share"
//               : "sponsor_commission",
//           status: "completed",
//           fromUser: user._id,
//                toUser:sponsorUser._id,
//           description: `Level ${level} sponsor commission`,
//           transactionId: txnId, // New unique transaction ID for sponsor share
//           processedAt: new Date(),
//         });
//         await sponsorTxn.save({ session });
//         sponsorUser.walletTransactions.push(sponsorTxn._id);
//         // Note: You had sponsorUser.donationsReceived.push(sponsorTxn._id); here.
//         // If sponsor share is considered a "donation", it should be added to `donationsReceived`.
//         // However, if `Donation` specifically tracks the main upgrade payment, then this might not be needed here.
//         // Assuming `Donation` is for the main upgrade amount, I've removed this line to avoid confusion.
//         // If sponsorShare is also a "donation" in your schema, you'd need a separate Donation entry for it.
//          donation = new Donation({
//         donor: user._id,
//         receiver: sponsorUser._id,
//         amount: flow.sponsorShare,
//         currentLevel: level,
//         status: "completed",
//         transactionId: txnId, // Use the same transaction ID as the upgrade payment
//       });
//       await donation.save({ session });
      
//       user.donationsSent.push(donation._id);
//       sponsorUser.donationsReceived.push(donation._id);
//         await sponsorUser.save({ session }); // Save sponsorUser changes here
//       }
//     }
    
//     // Update user level and save
//     user.currentLevel = level;
//     // The walletTransactions pushes are now handled inside the if/else blocks for clarity and correctness.
//     // If you need to push sponsorTxn._id here, ensure sponsorTxn is defined for all paths.
//     // For now, it's only pushed within the level === 1 block where it's created.
    
//     // Save all changes
//     await user.save({ session });
//     await recipientUser.save({ session });
//     // sponsorUser is saved inside its block if applicable
//     await session.commitTransaction();

//     return res.json({
//       success: true,
//       message: `Successfully upgraded to Level ${level}`,
//       newBalance: user.walletBalance,
//       newLevel: user.currentLevel,
//       matrixPlacement:
//         level === 1 ? `Placed under: ${actualUplineReferralCode}` : undefined,
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     console.error("Upgrade Error:", err);
//     return res.status(500).json({
//       message: "Upgrade failed",
//       error: err.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };
