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

// 🟩 Get All Add Fund Transactions for Logged-in User
exports.getUserTransactions = async (req, res) => {
  try {
    // Auth middleware sets req.user from JWT
    const userEmail = req.user.email;

    const transactions = await TransactionDetail.find({ email: userEmail })
      .sort({ createdAt: -1 })
      .select("name email Referalcode amount UTRno status createdAt updatedAt");

    return res.status(200).json({
      message: "User transactions fetched successfully",
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Fetch user transactions error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};