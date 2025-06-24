// controllers/donation.js
const express = require("express");
const Donation = require("../models/Donation");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const { v4: uuidv4 } = require("uuid");
const { razorpayinstance } = require("../config/razorpay");
const mongoose = require("mongoose");
const { LEVELS_CONFIG } = require("../config/levels"); // Import the config
const crypto = require("crypto"); // Added for signature verification

// Create Razorpay Order API
exports.capturePayment = async (req, res) => {
  const { currentLevel } = req.body;
const userId = req.user.id; // ✅ token se mila hua user ID
//   const { userId , currentLevel } = req.body; // This 'currentLevel' is the level being activated

  try {
    // Validate input
    if (!userId || currentLevel === undefined || currentLevel === null || currentLevel <= 0) {
      return res.status(400).json({ message: "Missing or invalid required fields: userId or currentLevel" });
    }

    const donor = await User.findById(userId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }

    // --- Level Activation Logic & Validation ---
    // Check if the donor has already activated this level or a higher level
    if (donor.currentLevel >= currentLevel) {
      return res.status(400).json({ message: `Level ${currentLevel} is already activated or a higher level is active for this user.` });
    }

    // Ensure sequential level activation (e.g., cannot activate Level 3 without Level 2)
    // Only applies if currentLevel > 1. For Level 1, donor.currentLevel should be 0 or undefined.
    if (currentLevel > 1 && donor.currentLevel < currentLevel - 1) {
      return res.status(400).json({ message: `Please activate Level ${currentLevel - 1} before activating Level ${currentLevel}.` });
    }
    // --- End Level Activation Logic & Validation ---

    // Get amount from LEVELS_CONFIG
    const levelInfo = LEVELS_CONFIG[currentLevel];
    if (!levelInfo) {
      return res.status(400).json({ message: `Configuration not found for Level ${currentLevel}.` });
    }

    const amountInRupees = levelInfo.amount;
    const amountInPaise = amountInRupees * 100; // Convert to paise for Razorpay

    // Find the upline (referredBy)
    const receiver = await User.findOne({ referralCode: donor.referredBy });
    if (!receiver) {
      // This should ideally not happen for a valid user or means they are the very first user.
      // Adjust this based on your platform's onboarding logic (e.g., assign to an admin if no upline)
      return res.status(404).json({ message: "Upline (receiver) not found for the donor. Cannot process donation." });
    }

    // Find the sponsor (sponserdBy) - optional
    const sponser = donor.sponserdBy ? await User.findOne({ referralCode: donor.sponserdBy }) : null;
    // If sponsor is mandatory and not found, add a check here.

    const options = {
      amount: amountInPaise.toString(), // Use the dynamically determined amount
      currency: "INR",
      receipt: uuidv4(),
      payment_capture: 1, // Auto-capture payment
      notes: {
        userId: userId.toString(),
        currentLevel: currentLevel.toString(), // Store the level being activated
        receiverId: receiver._id.toString(),
        ...(sponser && { sponserId: sponser._id.toString() }),
      },
    };

    const order = await razorpayinstance.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: err.message,
    });
  }
};


exports.verifyPayment = async (req, res) => {
    // Data sent from frontend's Razorpay handler
    const {userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, currentLevel } = req.body;
    // const userId = req.user.id; // From auth middleware

    // 1. Validate incoming data
    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        currentLevel === undefined || currentLevel === null ||
        !userId
    ) {
        console.error("Missing required payment verification parameters:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, currentLevel, userId });
        return res.status(400).json({ success: false, message: "Payment verification failed: Missing required data." });
    }

    // 2. Verify Razorpay Signature (Essential for security)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET) // Use RAZORPAY_KEY_SECRET
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        console.warn("Payment verification failed: Signature mismatch.");
        return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature." });
    }

    // 3. Fetch Donor and Level Configuration
    const levelToActivate = parseInt(currentLevel, 10);
    const levelInfo = LEVELS_CONFIG[levelToActivate];

    if (!levelInfo) {
        console.error(`Configuration not found for activated Level: ${levelToActivate}`);
        return res.status(400).json({ success: false, message: `Configuration not found for Level ${levelToActivate}.` });
    }

    const donor = await User.findById(userId).select(
        "+walletBalance +walletTransactions +currentLevel +donationsSent +referredBy +sponserdBy"
    );

    if (!donor) {
        console.error("Donor not found for payment verification.");
        return res.status(404).json({ success: false, message: "Donor not found." });
    }

    // Additional check: Ensure this level is not already activated or higher
    if (donor.currentLevel >= levelToActivate) {
        console.warn(`User ${userId} attempted to activate already active or lower level ${levelToActivate}. Current level: ${donor.currentLevel}`);
        // Consider this a success, as the level is already active.
        const updatedDonor = await User.findById(userId).select("-password -walletTransactions");
        return res.status(200).json({ success: true, message: "Level already activated.", data: updatedDonor });
    }
    // Also, ensure previous level is activated if required
    if (levelToActivate > 1 && donor.currentLevel < levelToActivate - 1) {
        console.error(`Payment for Level ${levelToActivate} received but Level ${levelToActivate - 1} is not activated for user ${userId}`);
        return res.status(400).json({ success: false, message: `Please activate Level ${levelToActivate - 1} first.` });
    }


    // 4. Fetch Receiver and Sponsor (upline network)
    const receiver = await User.findOne({ referralCode: donor.referredBy });
    if (!receiver) {
        console.error(`Receiver not found for donor ${userId} with referralCode ${donor.referredBy}.`);
        return res.status(400).json({ success: false, message: "Upline (receiver) not found. Cannot complete donation." });
    }

    let sponser = null;
    if (donor.sponserdBy) {
        sponser = await User.findOne({ referralCode: donor.sponserdBy });
    }

    // 5. Verify Amount (Optional but Recommended - fetches from Razorpay API)
    // This adds another layer of security, verifying the actual amount captured by Razorpay.
    try {
        const paymentDetails = await razorpayinstance.payments.fetch(razorpay_payment_id);
        const expectedAmountInPaise = levelInfo.amount * 100;
        
        if (paymentDetails.status !== 'captured') {
            console.error(`Payment ${razorpay_payment_id} status is not captured: ${paymentDetails.status}`);
            return res.status(400).json({ success: false, message: "Payment not captured by Razorpay." });
        }
        if (paymentDetails.amount !== expectedAmountInPaise) {
            console.error(`Amount mismatch for payment ${razorpay_payment_id}. Expected: ${expectedAmountInPaise}, Received: ${paymentDetails.amount}`);
            return res.status(400).json({ success: false, message: "Payment amount mismatch." });
        }
        if (paymentDetails.order_id !== razorpay_order_id) {
            console.error(`Order ID mismatch for payment ${razorpay_payment_id}. Expected: ${razorpay_order_id}, Received: ${paymentDetails.order_id}`);
            return res.status(400).json({ success: false, message: "Payment order ID mismatch." });
        }

    } catch (error) {
        console.error("Error fetching payment details from Razorpay API:", error);
        return res.status(500).json({ success: false, message: "Failed to verify payment with Razorpay API." });
    }

    // 6. Perform Database Updates within a Transaction
    const amount = levelInfo.amount; // Use amount from config after verification
    const transactionId = uuidv4();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Idempotency check: prevent double processing
        const existingDonation = await Donation.findOne({ paymentId: razorpay_payment_id }).session(session);
        if (existingDonation) {
            await session.commitTransaction();
            session.endSession();
            const updatedDonor = await User.findById(userId).select("-password -walletTransactions");
            return res.status(200).json({ success: true, message: "Donation already processed.", data: updatedDonor });
        }

        // Create new Donation record
        const donation = new Donation({
            donor: donor._id,
            receiver: receiver._id,
            amount,
            currentLevel: levelToActivate,
            status: "completed",
            transactionId,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
        await donation.save({ session });

        // 1. Receiver's transaction (Donation Received)
        const receiverShare = levelInfo.receiverShare;
        const receiverTxn = new WalletTransaction({
            amount: receiverShare,
            type: "donation_received",
            status: "completed",
            donationLevel: levelToActivate,
            fromUser: donor._id, // The donor is the 'fromUser' for receiver's income
            referenceId: donation._id, // Reference the Donation document
            transactionId: donation.transactionId,
            description: `Donation from ${donor.name || donor.email} for Level ${levelToActivate}`,
            processedAt: new Date(),
        });
        await receiverTxn.save({ session });
        receiver.walletBalance = (receiver.walletBalance || 0) + receiverShare;
        receiver.walletTransactions.push(receiverTxn._id); // Push only the ID
        receiver.donationsReceived.push(donation._id);

        // 2. Sponsor's transaction (if applicable)
        const sponsorShare = levelInfo.sponsorShare || 0;
        if (sponser && sponsorShare > 0) {
            const sponsorTxn = new WalletTransaction({
                amount: sponsorShare,
                type: "sponser_payment",
                status: "completed",
                donationLevel: levelToActivate,
                fromUser: donor._id, // The donor is the 'fromUser' for sponsor's income
                referenceId: donation._id,
                transactionId: donation.transactionId,
                description: `Sponsor payment from ${donor.name || donor.email} for Level ${levelToActivate}`,
                processedAt: new Date(),
            });
            await sponsorTxn.save({ session });
            sponser.walletBalance = (sponser.walletBalance || 0) + sponsorShare;
            sponser.walletTransactions.push(sponsorTxn._id); // Push only the ID
            await sponser.save({ session }); // Save sponsor separately in transaction
        }

        // 3. Donor's transaction (Donation Sent)
        const donorTxn = new WalletTransaction({
            amount: -amount, // Negative for expense
            type: "donation_sent",
            status: "completed",
            donationLevel: levelToActivate,
            toUser: receiver._id, // The receiver is the 'toUser' for donor's expense
            referenceId: donation._id,
            transactionId: donation.transactionId,
            description: `Payment for Level ${levelToActivate} to ${receiver.name || receiver.email} via Razorpay`,
            processedAt: new Date(),
        });
        await donorTxn.save({ session });
        donor.walletTransactions.push(donorTxn._id); // Push only the ID
        donor.donationsSent.push(donation._id);
        donor.currentLevel = levelToActivate;

        // Save donor and receiver (sponser was saved if applicable)
        await donor.save({ session });
        await receiver.save({ session });

        await session.commitTransaction();

        const updatedDonor = await User.findById(userId).select("-password -walletTransactions");
        return res.status(200).json({
            success: true,
            message: "Payment verified and level activated successfully.",
            data: updatedDonor,
        });
    } catch (error) {
        await session.abortTransaction(); // Rollback on error
        return res.status(500).json({ success: false, message: "Payment processing failed.", error: error.message });
    } finally {
        session.endSession(); // End the session
    }
};


// New controller for transferring funds from wallet to downline
exports.transferFundsToDownline = async (req, res) => {
  const senderId = req.user.id; // The user initiating the transfer (from token)
  const { recipientReferralCode, amount } = req.body;

  // 1. Validate Input
  if (!recipientReferralCode || !amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: "Invalid recipient referral code or amount." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Fetch Sender (user initiating the transfer)
    const sender = await User.findById(senderId).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Sender user not found." });
    }

    // 3. Fetch Recipient (downline user)
    const recipient = await User.findOne({ referralCode: recipientReferralCode }).session(session);
    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient user not found with that referral code." });
    }

    
    // 5. Check Sender's Wallet Balance
    if (sender.walletBalance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient wallet balance to transfer." });
    }

    // 6. Update Balances
    sender.walletBalance -= amount;
    recipient.walletBalance += amount;

    // 7. Create Wallet Transactions for both sender and recipient
    const transactionId = uuidv4();

    // Sender's transaction
    const senderTxn = new WalletTransaction({
      amount: -amount, // Negative as it's an expense
      type: "fund_transfer_sent",
      status: "completed",
      toUser: recipient._id,
      description: `Funds transferred to downline user ${recipient.name || recipient.email} (${recipient.referralCode})`,
      transactionId: transactionId,
      processedAt: new Date(),
    });
    await senderTxn.save({ session });
    sender.walletTransactions.push(senderTxn._id);
    sender.donationsSent.push(senderTxn._id);
    // Recipient's transaction
    const recipientTxn = new WalletTransaction({
      amount: amount, // Positive as it's income
      type: "fund_transfer_received",
      status: "completed",
      fromUser: sender._id,
      description: `Funds received from upline user ${sender.name || sender.email} (${sender.referralCode})`,
      transactionId: transactionId,
      processedAt: new Date(),
    });
    await recipientTxn.save({ session });
    recipient.walletTransactions.push(recipientTxn._id);
    recipient.donationsReceived.push(recipientTxn._id);
    // 8. Save updated User documents
    await sender.save({ session });
    await recipient.save({ session });

    // 9. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Successfully transferred ₹${amount.toFixed(2)} to ${recipient.name || 'downline user'}.`,
      senderNewBalance: sender.walletBalance.toFixed(2),
    });

  } catch (error) {
    await session.abortTransaction(); // Rollback on error
    session.endSession();
    console.error("Error transferring funds to downline:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to transfer funds. Please try again later.",
      error: error.message,
    });
  }
};

const jwt = require('jsonwebtoken'); // यदि आप टोकन सत्यापन का उपयोग कर रहे हैं


exports.getUserByReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params; // Get referral code from URL parameters
    if (!referralCode) {
      return res.status(400).json({ success: false, message: "Referral code is required." });
    }

    // Case-insensitive search: Use new RegExp with 'i' flag
    const user = await User.findOne({ referralCode: new RegExp(`^${referralCode}$`, 'i') }).select('name email referralCode'); // Only select necessary fields

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this referral code." });
    }

    return res.status(200).json({ success: true, user: { name: user.name, referralCode: user.referralCode, email: user.email } });
  } catch (error) {
    console.error("Error fetching user by referral code:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};


