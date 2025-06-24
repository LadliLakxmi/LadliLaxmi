const TransactionDetail = require("../models/TransactionDetail");

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

// 3. Update Status (admin approval)
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await TransactionDetail.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({
      message: "Transaction status updated successfully",
      updatedTransaction: updated,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
