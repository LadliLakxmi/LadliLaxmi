
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Donation = require("../models/Donation");
const WalletTransaction = require("../models/WalletTransaction");
const { findMatrixSlot } = require("../utils/matrix");

const LEVEL_FLOW = {
  1: { amount: 300, uplineIncome: 600, upgradeCost: 500,sponsorShare: 100,  netIncome: 100 },
  2: { amount: 500, uplineIncome: 2000, upgradeCost: 1000,sponsorShare: 0,  netIncome: 1000 },
  3: { amount: 1000, uplineIncome: 8000, upgradeCost: 2000,sponsorShare: 0, netIncome: 6000 },
  4: { amount: 2000, uplineIncome: 32000, upgradeCost: 4000,sponsorShare: 0, netIncome: 28000 },
  5: { amount: 4000, uplineIncome: 128000, upgradeCost: 8000, sponsorShare: 0,netIncome: 120000 },
  6: { amount: 8000, uplineIncome: 512000, upgradeCost: 16000,sponsorShare: 0, netIncome: 496000 },
  7: { amount: 16000, uplineIncome: 2048000, upgradeCost: 32000, sponsorShare: 0,netIncome: 2016000 },
  8: { amount: 32000, uplineIncome: 8192000, upgradeCost: 64000,sponsorShare: 0, netIncome: 8128000 },
  9: { amount: 64000, uplineIncome: 32768000, upgradeCost: 128000,sponsorShare: 0, netIncome: 32640000 },
  10: { amount: 128000, uplineIncome: 131072000, upgradeCost: 256000,sponsorShare: 0, netIncome: 130816000 },
  11: { amount: 256000, uplineIncome: 524288000, upgradeCost: null,sponsorShare: 0, netIncome: 5242880000 },
};

// Helper function to find upline (optimized and fixed)
async function findSpecificUpline(starterUserId, hops, session) {
  if (hops === 0) return await User.findById(starterUserId).session(session);

  let currentUser = await User.findById(starterUserId).session(session);
    if (!currentUser) return null;

  // Traverse up the referral chain
  for (let i = 0; i < hops; i++) {
    if (!currentUser.referredBy) return null;
    currentUser = await User.findOne({
      referralCode: currentUser.referredBy,
    }).session(session);
     
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
    if (user.walletBalance < totalRequired) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient wallet balance",
        required: totalRequired,
        current: user.walletBalance,
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
      console.log("before sponsorDuringRegistration",sponsorDuringRegistration)
      if (
        !sponsorDuringRegistration ||
        sponsorDuringRegistration.currentLevel === 0
      ) {
        // Fallback to admin if sponsor not found (e.g., initial admin placement)
        sponsorDuringRegistration = await User.findOne({
          referralCode: "R7365482",
        }).session(session);
        // here chnage admin with company referral code
        if (!sponsorDuringRegistration) {
          await session.abortTransaction();
          return res
          .status(500)
          .json({ message: "Company account not found for matrix placement." });
        }
      }
      console.log("After sponsorDuringRegistration",sponsorDuringRegistration)
      

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
      await user.save({ session });


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
      recipientUser = await User.findOne({ referralCode: "R7079AEU" }).session(session);
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
    // Handle sponsor payment (level 1 only)
    if (
      level === 1 &&
      recipientUser &&
      sponsorUser &&
      recipientUser._id.equals(sponsorUser._id)
    ) {
      console.log("sponsorUser.walletBalance: ", recipientUser.walletBalance);
      const combinedAmount = flow.amount + flow.sponsorShare;

      // Deduct combined amount from user's wallet
      user.walletBalance -= combinedAmount;
      // Add combined amount to the shared recipient/sponsor's wallet
      recipientUser.walletBalance += combinedAmount; // recipientUser is the same as sponsorUser here

      console.log("sponsorUser.walletBalance: ", recipientUser.walletBalance);
      // Create a single wallet transaction for the shared recipient/sponsor
      const combinedTxnId = uuidv4();
      const userCombinedTxn = new WalletTransaction({
        amount: -combinedAmount,
        type: "upgrade_payment_sent_and_sponsor_share_sent",
        status: "completed",
        toUser: recipientUser._id,
        description: `Combined payment for Level ${level} upgrade and sponsor share`,
        transactionId: combinedTxnId,
        processedAt: new Date(),
      });
      await userCombinedTxn.save({ session });

      const recipientCombinedTxn = new WalletTransaction({
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
      await recipientCombinedTxn.save({ session });

      user.walletTransactions.push(userCombinedTxn._id);
      recipientUser.walletTransactions.push(recipientCombinedTxn._id);
    } else {
      // --- Existing logic for separate payments ---

      // Deduct upgrade payment from user's wallet
      user.walletBalance -= flow.amount;
      // Add upgrade payment to recipientUser's wallet
      recipientUser.walletBalance += flow.amount;

      // Create separate transaction records for upgrade payment
      const txnId = uuidv4();
      const userTxn = new WalletTransaction({
        amount: -flow.amount,
        type: "upgrade_payment_sent",
        status: "completed",
        toUser: recipientUser._id,
        description: `Upgrade to Level ${level} payment`,
        transactionId: txnId,
        processedAt: new Date(),
      });
      await userTxn.save({ session });

      const recipientTxn = new WalletTransaction({
        amount: flow.amount,
        type:
          paymentDestinationType === "admin"
            ? "admin_upgrade_revenue"
            : "upline_upgrade_commission",
        status: "completed",
        fromUser: user._id,
        description: `Level ${level} upgrade from ${user.email}`,
        transactionId: txnId,
        processedAt: new Date(),
      });
      await recipientTxn.save({ session });

      user.walletTransactions.push(userTxn._id);
      recipientUser.walletTransactions.push(recipientTxn._id);

      // Handle sponsor payment (level 1 only) if different from recipient
      if (level === 1) {
        user.walletBalance -= flow.sponsorShare;
        sponsorUser.walletBalance += flow.sponsorShare;

        const sponsorTxn = new WalletTransaction({
          amount: flow.sponsorShare,
          type:
            sponsorUser.role === "Admin"
              ? "admin_sponsor_share"
              : "sponsor_commission",
          status: "completed",
          fromUser: user._id,
          description: `Level ${level} sponsor commission`,
          transactionId: uuidv4(), // New transaction ID for sponsor share
          processedAt: new Date(),
        });
        await sponsorTxn.save({ session });
        sponsorUser.walletTransactions.push(sponsorTxn._id);
        await sponsorUser.save({ session }); // Save sponsorUser changes here
      }
    }
    // Update user level and save
    user.currentLevel = level;
    user.walletTransactions.push(userTxn._id);
    recipientUser.walletTransactions.push(recipientTxn._id);

    // Create donation record
    const donation = new Donation({
      donor: user._id,
      receiver: recipientUser._id,
      amount: flow.amount,
      currentLevel: level,
      status: "completed",
      transactionId: uuidv4(),
    });
    await donation.save({ session });

    // Save all changes
    await user.save({ session });
    await recipientUser.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: `Successfully upgraded to Level ${level}`,
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
};// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
// const User = require("../models/User");
// const Donation = require("../models/Donation");
// const WalletTransaction = require("../models/WalletTransaction");


// const LEVEL_FLOW = {
//   1: { amount: 300, uplineIncome: 600, upgradeCost: 500,sponsorShare: 100,  netIncome: 100 },
//   2: { amount: 500, uplineIncome: 2000, upgradeCost: 1000,sponsorShare: 0,  netIncome: 1000 },
//   3: { amount: 1000, uplineIncome: 8000, upgradeCost: 2000,sponsorShare: 0, netIncome: 6000 },
//   4: { amount: 2000, uplineIncome: 32000, upgradeCost: 4000,sponsorShare: 0, netIncome: 28000 },
//   5: { amount: 4000, uplineIncome: 128000, upgradeCost: 8000, sponsorShare: 0,netIncome: 120000 },
//   6: { amount: 8000, uplineIncome: 512000, upgradeCost: 16000,sponsorShare: 0, netIncome: 496000 },
//   7: { amount: 16000, uplineIncome: 2048000, upgradeCost: 32000, sponsorShare: 0,netIncome: 2016000 },
//   8: { amount: 32000, uplineIncome: 8192000, upgradeCost: 64000,sponsorShare: 0, netIncome: 8128000 },
//   9: { amount: 64000, uplineIncome: 32768000, upgradeCost: 128000,sponsorShare: 0, netIncome: 32640000 },
//   10: { amount: 128000, uplineIncome: 131072000, upgradeCost: 256000,sponsorShare: 0, netIncome: 130816000 },
//   11: { amount: 256000, uplineIncome: 524288000, upgradeCost: null,sponsorShare: 0, netIncome: 524288000 },
// };

// // Helper function to find upline (optimized and fixed)
// async function findSpecificUpline(starterUserId, hops, session) {
//   if (hops === 0) return await User.findById(starterUserId).session(session);
  
//   let currentUser = await User.findById(starterUserId).session(session);
//   if (!currentUser) return null;

//   // Traverse up the referral chain
//   for (let i = 0; i < hops; i++) {
//     if (!currentUser.referredBy) return null;
//     currentUser = await User.findOne({ referralCode: currentUser.referredBy }).session(session);
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
//         message: `Invalid upgrade sequence. Current level: ${user.currentLevel}, next required: ${user.currentLevel + 1}` 
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

//     // Find recipient for upgrade payment
//     const hopsRequired = level;  // Corrected hops calculation
//     let recipientUser = await findSpecificUpline(userId, hopsRequired, session);
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
//       sponsorUser = await User.findOne({ referralCode: user.sponserdBy }).session(session);
//       if (!sponsorUser) {
//         sponsorUser = await User.findOne({ role: "Admin" }).session(session);
//         if (!sponsorUser) {
//           await session.abortTransaction();
//           return res.status(500).json({ message: "Admin account not found for sponsor payment." });
//         }
//       }
//     }

//     // Perform wallet transactions
//     user.walletBalance -= flow.amount;
//     recipientUser.walletBalance += flow.amount;

//     // Create transaction records
//     const txnId = uuidv4();
//     const userTxn = new WalletTransaction({
//       amount: -flow.amount,
//       type: "upgrade_payment_sent",
//       status: "completed",
//       toUser: recipientUser._id,
//       description: `Upgrade to Level ${level} payment`,
//       transactionId: txnId,
//       processedAt: new Date(),
//     });
//     await userTxn.save({ session });

//     const recipientTxn = new WalletTransaction({
//       amount: flow.amount,
//       type: paymentDestinationType === "admin" 
//         ? "admin_upgrade_revenue" 
//         : "upline_upgrade_commission",
//       status: "completed",
//       fromUser: user._id,
//       description: `Level ${level} upgrade from ${user.email}`,
//       transactionId: txnId,
//       processedAt: new Date(),
//     });
//     await recipientTxn.save({ session });

//     // Handle sponsor payment (level 1 only)
//     if (level === 1) {
//       user.walletBalance -= flow.sponsorShare;
//       sponsorUser.walletBalance += flow.sponsorShare;

//       const sponsorTxn = new WalletTransaction({
//         amount: flow.sponsorShare,
//         type: sponsorUser.role === "Admin" 
//           ? "admin_sponsor_share" 
//           : "sponsor_commission",
//         status: "completed",
//         fromUser: user._id,
//         description: `Level ${level} sponsor commission`,
//         transactionId: uuidv4(),
//         processedAt: new Date(),
//       });
//       await sponsorTxn.save({ session });
//       sponsorUser.walletTransactions.push(sponsorTxn._id);
//       await sponsorUser.save({ session });
//     }

//     // Update user level and save
//     user.currentLevel = level;
//     user.walletTransactions.push(userTxn._id);
//     recipientUser.walletTransactions.push(recipientTxn._id);

//     // Create donation record
//     const donation = new Donation({
//       donor: user._id,
//       receiver: recipientUser._id,
//       amount: flow.amount,
//       currentLevel: level,
//       status: "completed",
//       transactionId: uuidv4(),
//     });
//     await donation.save({ session });

//     // Save all changes
//     await user.save({ session });
//     await recipientUser.save({ session });
//     await session.commitTransaction();

//     return res.json({
//       success: true,
//       message: `Successfully upgraded to Level ${level}`,
//       newBalance: user.walletBalance,
//       newLevel: user.currentLevel,
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     console.error("Upgrade Error:", err);
//     return res.status(500).json({ 
//       message: "Upgrade failed", 
//       error: err.message 
//     });
//   } finally {
//     session.endSession();
//   }
// };
