const TransactionDetail = require("../models/TransactionDetail");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const { v4: uuidv4 } = require("uuid");

// 1. Create Transaction (used by users)
exports.transactiondetails = async (req, res) => {
  try {
    // 1. Frontend se sirf UTRno lein
    const { UTRno } = req.body;

    // 2. User details (jo logged-in hai) auth middleware se lein
    const { name, email, referralCode } = req.user; 
    
    // 3. Amount ko backend mein fix karein
    const amount = 400;

    // 4. Validation
    if (!UTRno) {
      return res.status(400).json({ message: "UTR number is required" });
    }

    if (!name || !email || !referralCode) {
        return res.status(400).json({ message: "User details (name, email, or code) not found." });
    }

    const newTransaction = new TransactionDetail({
      name: name,
      email: email,
      Referalcode: referralCode, // ✅ Sahi User ID (token se)
      amount: amount,
      UTRno: UTRno,
      status: "pending", // default, but adding explicitly
    });

    await newTransaction.save();

    return res.status(201).json({
      message: "Transaction details saved successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.UTRno) {
      return res.status(409).json({
        message: "A transaction with this UTR number already exists."
      });
    } 
    console.error("Transaction save error:", error);
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

// controllers/transactiondata.js

// 2. Get All Transactions (admin dashboard) - ✅ PAGINATED VERSION
exports.getAllTransactions = async (req, res) => {
  try {
    // 1. Query se page aur limit lein, ya default set karein
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30; // Ek page par 20 records
    const skip = (page - 1) * limit; // Kitne records skip karne hain

    // // 2. Database se TOTAL count pata karein (pagination ke liye)
    // const totalTransactions = await TransactionDetail.countDocuments();
    
    // // 3. Sorting ko backend me karein:
    // //    status: -1 (Z-A) = "rejected", "pending", "approved"
    // //    createdAt: -1 = Naya sabse upar
    // const transactions = await TransactionDetail.find()
    //   .sort({ createdAt: -1 }) 
    //   .skip(skip)
    //   .limit(limit);

    // ✅ Aggregation Pipeline for Custom Sort (pending > approved > rejected)
    const pipeline = [
      {
        // 1. Naya 'sortPriority' field banayein
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending"] }, then: 1 },
                { case: { $eq: ["$status", "approved"] }, then: 2 },
                { case: { $eq: ["$status", "rejected"] }, then: 3 }
              ],
              default: 4 
            }
          }
        }
      },
      {
        // 2. Custom field se sort karein, phir date se
        $sort: {
          sortPriority: 1,  // 1 = Ascending (1, 2, 3)
          createdAt: -1   // Naya sabse upar
        }
      },
      {
        // 3. Pagination ke liye $facet
        $facet: {
          metadata: [ 
            { $count: 'totalTransactions' }
          ],
          data: [ 
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];

    // Pipeline ko run karein
    const results = await TransactionDetail.aggregate(pipeline);

    const transactions = results[0].data;
    const totalTransactions = results[0].metadata[0] ? results[0].metadata[0].totalTransactions : 0;
    
    // 4. Frontend ko sab kuch bhejein
    return res.status(200).json({
      message: "Fetched all transactions",
      transactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      totalTransactions: totalTransactions,
    });

  } catch (error) {
    console.error("Fetch transactions error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ...
// 3. Check if UTR Exists (For Frontend Validation)
exports.checkUtrExists = async (req, res) => {
  try {
    const { utr } = req.params; // :utr parameter se UTR lein
    if (!utr) {
      return res.status(400).json({ exists: false, message: "UTR number is required." });
    }

    // countDocuments aur index (step 1 se) ka istemal karke yeh bahut fast hoga
    const count = await TransactionDetail.countDocuments({ UTRno: utr });

    if (count > 0) {
      // Haan, UTR mil gaya
      return res.status(200).json({ exists: true, message: "UTR already used." });
    } else {
      // Nahi mila
      return res.status(200).json({ exists: false, message: "UTR is available." });
    }
  } catch (error) {
    console.error("Check UTR error:", error);
    res.status(500).json({ message: "Server error checking UTR." });
  }
};

