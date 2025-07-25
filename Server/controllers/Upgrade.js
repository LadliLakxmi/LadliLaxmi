const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Donation = require("../models/Donation");
const WalletTransaction = require("../models/WalletTransaction");
const { findMatrixSlot } = require("../utils/matrix");

const LEVEL_FLOW = {
  1: {
    amount: 300, //level 1 update krne par upline ko jane wala amount
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
          referralCode: "R1403ITX",
        }).session(session);
        // here chnage admin with company referral code
        if (!sponsorDuringRegistration) {
          await session.abortTransaction();
          return res.status(500).json({
            message: "Company account not found for matrix placement.",
          });
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
      await user.save({ session }); // Will be saved at the end of the transaction

      // Add new user to the directReferrals of the original sponsor (whoever invited them)
      if (
        sponsorDuringRegistration &&
        !sponsorDuringRegistration.directReferrals.includes(user._id)
      ) {
        sponsorDuringRegistration.directReferrals.push(user._id);
        await sponsorDuringRegistration.save({ session });
      }
      actualUplineReferralCode = slotUser.referralCode; // This will be the direct matrix upline
    }

    // Find recipient for upgrade payment
    const hopsRequired = level; // Corrected hops calculation
    let recipientUser = await findSpecificUpline(userId, hopsRequired, session);
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
        sponsorUser = await User.findOne({ referralCode: "R1403ITX" }).session(
          session
        );
        if (!sponsorUser) {
          await session.abortTransaction();
          return res.status(500).json({
            message: "Company account not found for sponsor payment.",
          });
        }
      }
    }

    // Declare transaction variables at a higher scope
    let userTxn, recipientTxn, sponsorTxn;
    let combinedTxnId;
    // Create donation record placeholder (will be populated and saved later)
    let donation;
    let recipientPaymentsForThisLevel =
      recipientUser.levelPaymentsReceived.get(level.toString()) || 0;

    // Handle combined payment for Level 1 if recipient and sponsor are the same
    if (
      level === 1 &&
      recipientUser &&
      sponsorUser &&
      recipientUser._id.equals(sponsorUser._id)
    ) {
      const combinedAmount = flow.amount + flow.sponsorShare;

      // Deduct combined amount from user's wallet
      user.upgradewalletBalance -= combinedAmount;

      if (recipientPaymentsForThisLevel < 1) {
        recipientUser.upgradewalletBalance += flow.amount;
        recipientUser.walletBalance += flow.sponsorShare;
      } else {
        recipientUser.upgradewalletBalance += flow.amount - 100;
        recipientUser.walletBalance += flow.sponsorShare + 100;
      }
      // Increment the count for this level for the recipient
      recipientUser.levelPaymentsReceived.set(
        level.toString(),
        recipientPaymentsForThisLevel + 1
      );

      // Create a single wallet transaction for the shared recipient/sponsor
      combinedTxnId = uuidv4();
      userTxn = new WalletTransaction({
        // Assign to already declared variable
        amount: -combinedAmount,
        type: "upgrade_payment_sent_and_sponsor_share_sent",
        status: "completed",
        toUser: recipientUser._id,
        fromUser: user._id,
        description: `Combined payment for Level ${level} upgrade and sponsor share`,
        transactionId: combinedTxnId,
        processedAt: new Date(),
      });
      await userTxn.save({ session });

      recipientTxn = new WalletTransaction({
        // Assign to already declared variable
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

      // --- NEW LOGIC: Route main upgrade payment based on count for recipient ---
      if (recipientPaymentsForThisLevel < 2) {
        recipientUser.upgradewalletBalance += flow.amount;
      } else {
        if (!recipientUser.currentLevel > user.currentLevel) {
          recipientUser.upgradewalletBalance += flow.amount;
        } else {
          recipientUser.walletBalance += flow.amount;
        }
      }
      // Increment the count for this level for the recipient
      recipientUser.levelPaymentsReceived.set(
        level.toString(),
        recipientPaymentsForThisLevel + 1
      );

      // Create separate transaction records for upgrade payment
      const txnId = uuidv4(); // Unique for this upgrade part
      userTxn = new WalletTransaction({
        // Assign to already declared variable
        amount: -flow.amount,
        type: "upgrade_payment_sent",
        status: "completed",
        toUser: recipientUser._id,
        fromUser: user._id,
        description: `Upgrade to Level ${level} payment`,
        transactionId: txnId,
        processedAt: new Date(),
      });
      await userTxn.save({ session });

      recipientTxn = new WalletTransaction({
        // Assign to already declared variable
        amount: flow.amount,
        type:
          paymentDestinationType === "admin"
            ? "admin_upgrade_revenue"
            : "upline_upgrade_commission",
        status: "completed",
        fromUser: user._id,
        toUser: recipientUser._id,
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
      if (level === 1) {
        // This block is ONLY if recipientUser and sponsorUser are DIFFERENT
        user.upgradewalletBalance -= flow.sponsorShare;
        sponsorUser.walletBalance += flow.sponsorShare;
        const txnId = uuidv4();
        sponsorTxn = new WalletTransaction({
          // Assign to already declared variable
          amount: flow.sponsorShare,
          type:
            sponsorUser.role === "Admin"
              ? "admin_sponsor_share"
              : "sponsor_commission",
          status: "completed",
          fromUser: user._id,
          toUser: sponsorUser._id,
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
    const paymentsReceivedForThisLevel = user.levelPaymentsReceived.get(level.toString()) || 0;

    if (paymentsReceivedForThisLevel > 2) {
      // Calculate the number of excess payments
      const excessPaymentsCount = paymentsReceivedForThisLevel - 2;

      // Calculate the amount to transfer to main wallet.
      // Assuming each payment for this level was 'flow.amount'.
      const amountToTransfer = excessPaymentsCount * flow.amount;

      // Ensure the upgradeWalletBalance has enough funds (it should, as these were stored there)
      if (user.upgradewalletBalance >= amountToTransfer) {
        user.upgradewalletBalance -= amountToTransfer; // Deduct from upgrade wallet
        user.walletBalance += amountToTransfer; // Add to main wallet
      } else {
        console.warn(
          `Insufficient funds in upgrade wallet for transfer for user ${user.email} (Level ${level}). Expected: ${amountToTransfer}, Actual: ${user.upgradewalletBalance}`
        );
      }
    }

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
