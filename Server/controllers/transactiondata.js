const TransactionDetail = require("../models/TransactionDetail");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const { v4: uuidv4 } = require("uuid");

// 1. Create Transaction (used by users)
exports.transactiondetails = async (req, res) => {
  try {
    const { name, email, Referalcode, amount, UTRno } = req.body;

    if (!name || !email || !Referalcode || !amount || !UTRno) {
      return res.status(400).json({ message: "All fields are required" });
    }

     // --- NEW: Prevent duplicate UTRno ---
    const existingTransaction = await TransactionDetail.findOne({ UTRno });
    if (existingTransaction) {
      return res.status(409).json({ message: "A transaction with this UTR number already exists." });
    }

    const newTransaction = new TransactionDetail({
      name,
      email,
      Referalcode,
      amount,
      UTRno,
      status: "pending", // default, but adding explicitly
    });

    await newTransaction.save();

    return res.status(201).json({
      message: "Transaction details saved successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Transaction save error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 2. Get All Transactions (admin dashboard)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionDetail.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Fetched all transactions",
      transactions,
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// // 3. Update Status (admin approval)
// exports.updateTransactionStatus = async (req, res) => {
//   const session = await TransactionDetail.startSession();
//   session.startTransaction();
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (![ "pending","approved", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     // 1️⃣ Fetch the transaction
//     const transaction = await TransactionDetail.findById(id).session(session);
//     if (!transaction) {
//       await session.abortTransaction();
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     // Prevent double processing
//     if (transaction.status !== "pending") {
//       await session.abortTransaction();
//       return res.status(400).json({ message: "Transaction already processed" });
//     }

//     // 2️⃣ Update Transaction status
//     transaction.status = status;
//     await transaction.save({ session });

//     // 3️⃣ If approved — credit wallet & create wallet transaction record
//     if (status === "approved") {
//       // Find the user based on email or referral code from transaction
//       const user = await User.findOne({
//         $or: [
//           { email: transaction.email },
//           { referralCode: transaction.Referalcode }
//         ]
//       }).session(session);

//       if (!user) {
//         await session.abortTransaction();
//         return res.status(404).json({ message: "User not found for this transaction" });
//       }

//       // Credit the wallet (ensure number addition, not string concatenation)
//       const amountToAdd = Number(transaction.amount) || 0; // fallback to 0 if invalid
//       user.upgradewalletBalance = Number(user.upgradewalletBalance || 0) + amountToAdd;

//       // Create Wallet Transaction
//       const walletTxn = new WalletTransaction({
//         user: user._id,
//         amount: transaction.amount,
//         type: "deposit", // custom label
//         fromUser: "683949730c453de29aa39b83", // or "ADMIN"
//         toUser: user._id,
//         status: "completed",
//         description: `Deposit approved for ${user.name}`,
//         transactionId: uuidv4(),
//         processedAt: new Date(),
//       });

//       await walletTxn.save({ session });
//       user.walletTransactions.push(walletTxn._id);

//       await user.save({ session });
//     }

//     await session.commitTransaction();

//     return res.status(200).json({
//       message: `Transaction status updated to ${status}`,
//       updatedTransaction: transaction,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Update status error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

exports.updateTransactionStatus = async (req, res) => {
  const session = await TransactionDetail.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🔹 Atomic fetch and ensure pending
    const transaction = await TransactionDetail.findOne({ _id: id, status: "pending" }).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Transaction not found or already processed" });
    }

    // Update status
    transaction.status = status;
    await transaction.save({ session });

    if (status === "approved") {
      const user = await User.findOne({
        $or: [
          { email: transaction.email },
          { referralCode: transaction.Referalcode } // check field name in schema
        ]
      }).session(session);

      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ message: "User not found for this transaction" });
      }

      const amountToAdd = Number(transaction.amount);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Invalid transaction amount" });
      }

      user.upgradewalletBalance = Number(user.upgradewalletBalance || 0) + amountToAdd;

      const walletTxn = new WalletTransaction({
        user: user._id,
        amount: amountToAdd,
        type: "deposit",
        fromUser: "683949730c453de29aa39b83", // ADMIN
        toUser: user._id,
        status: "completed",
        description: `Deposit approved for ${user.name}`,
        transactionId: uuidv4(),
        processedAt: new Date(),
      });

      await walletTxn.save({ session });
      user.walletTransactions.push(walletTxn._id);
      await user.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json({
      message: `Transaction status updated to ${status}`,
      updatedTransaction: transaction,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// const TransactionDetail = require("../models/TransactionDetail");

// // 1. Create Transaction (used by users)
// exports.transactiondetails = async (req, res) => {
//   try {
//     const { name, email, Referalcode, amount, UTRno } = req.body;

//     if (!name || !email || !Referalcode || !amount || !UTRno) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//      // --- NEW: Prevent duplicate UTRno ---
//     const existingTransaction = await TransactionDetail.findOne({ UTRno });
//     if (existingTransaction) {
//       return res.status(409).json({ message: "A transaction with this UTR number already exists." });
//     }

//     const newTransaction = new TransactionDetail({
//       name,
//       email,
//       Referalcode,
//       amount,
//       UTRno,
//       status: "pending", // default, but adding explicitly
//     });

//     await newTransaction.save();

//     return res.status(201).json({
//       message: "Transaction details saved successfully",
//       transaction: newTransaction,
//     });
//   } catch (error) {
//     console.error("Transaction save error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// // 2. Get All Transactions (admin dashboard)
// exports.getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await TransactionDetail.find().sort({ createdAt: -1 });
//     return res.status(200).json({
//       message: "Fetched all transactions",
//       transactions,
//     });
//   } catch (error) {
//     console.error("Fetch transactions error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// // 3. Update Status (admin approval)
// exports.updateTransactionStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (![ "pending","approved", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const updated = await TransactionDetail.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     return res.status(200).json({
//       message: "Transaction status updated successfully",
//       updatedTransaction: updated,
//     });
//   } catch (error) {
//     console.error("Update status error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
