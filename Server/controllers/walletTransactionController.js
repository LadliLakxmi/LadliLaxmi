const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User'); // IMPORTANT: Make sure you import your User model here

// @desc    Get all wallet transactions
// @route   GET /api/wallet-transactions
// @access  Public (or Private, depending on your auth setup)
const getAllWalletTransactions = async (req, res) => {
  try {
    // Optionally populate user fields here if needed for all transactions
    const transactions = await WalletTransaction.find({})
      .populate('fromUser', 'name email') // Example: populate name and email of fromUser
      .populate('toUser', 'name email');   // Example: populate name and email of toUser

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single wallet transaction by ID
// @route   GET /api/wallet-transactions/:id
// @access  Public (or Private)
const getWalletTransactionById = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findById(req.params.id)
      .populate('fromUser', 'name email') // Populate for single transaction as well
      .populate('toUser', 'name email');

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new wallet transaction
// @route   POST /api/wallet-transactions
// @access  Private (usually for internal system or authenticated users)
const createWalletTransaction = async (req, res) => {
  try {
    // When creating, you typically only provide user IDs in req.body
    const transaction = await WalletTransaction.create(req.body);

    // After creating, if you want to return the populated transaction immediately
    // you would need to find it again and populate, or populate it before sending.
    const populatedTransaction = await WalletTransaction.findById(transaction._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    // Handle validation errors or other specific Mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// @desc    Update a wallet transaction
// @route   PUT /api/wallet-transactions/:id
// @access  Private
const updateWalletTransaction = async (req, res) => {
  try {
    let transaction = await WalletTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // `new: true` returns the updated document, and then you populate it.
    transaction = await WalletTransaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true // Run schema validators on update
    })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// @desc    Delete a wallet transaction
// @route   DELETE /api/wallet-transactions/:id
// @access  Private
const deleteWalletTransaction = async (req, res) => {
  try {
    const transaction = await WalletTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    await WalletTransaction.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} }); // Return empty object or a success message
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get wallet transactions for a specific user
// @route   GET /api/wallet-transactions/user/:userId
// @access  Private (should be authenticated user fetching their own data)
const getTransactionsForUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Get user ID from URL parameter

    // Build query to find transactions where the user is either the sender or receiver
    const query = {
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    };

    // Find transactions, sort by creation date (newest first), and crucially, POPULATE user details
    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 }) // Sort by createdAt descending (newest first)
      .limit(20) // Limit to a reasonable number for recent activities, e.g., 20
      .populate('fromUser', 'name email') // Populate 'fromUser' field, selecting 'name', 'email', and 'profilePicture' fields
      .populate('toUser', 'name email ');   // Populate 'toUser' field, selecting 'name', 'email', and 'profilePicture' fields

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllWalletTransactions,
  getWalletTransactionById,
  createWalletTransaction,
  updateWalletTransaction,
  deleteWalletTransaction,
  getTransactionsForUser,
};
// // controllers/walletTransactionController.js
// const WalletTransaction = require('../models/WalletTransaction');

// // @desc    Get all wallet transactions
// // @route   GET /api/wallet-transactions
// // @access  Public (or Private, depending on your auth setup)
// const getAllWalletTransactions = async (req, res) => {
//   try {
//     const transactions = await WalletTransaction.find({});
//     res.status(200).json({ success: true, count: transactions.length, data: transactions });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Get a single wallet transaction by ID
// // @route   GET /api/wallet-transactions/:id
// // @access  Public (or Private)
// const getWalletTransactionById = async (req, res) => {
//   try {
//     const transaction = await WalletTransaction.findById(req.params.id);

//     if (!transaction) {
//       return res.status(404).json({ success: false, error: 'Transaction not found' });
//     }

//     res.status(200).json({ success: true, data: transaction });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Create a new wallet transaction
// // @route   POST /api/wallet-transactions
// // @access  Private (usually for internal system or authenticated users)
// const createWalletTransaction = async (req, res) => {
//   try {
//     const transaction = await WalletTransaction.create(req.body);
//     res.status(201).json({ success: true, data: transaction });
//   } catch (error) {
//     // Handle validation errors or other specific Mongoose errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({ success: false, error: messages });
//     } else {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   }
// };

// // @desc    Update a wallet transaction
// // @route   PUT /api/wallet-transactions/:id
// // @access  Private
// const updateWalletTransaction = async (req, res) => {
//   try {
//     let transaction = await WalletTransaction.findById(req.params.id);

//     if (!transaction) {
//       return res.status(404).json({ success: false, error: 'Transaction not found' });
//     }

//     transaction = await WalletTransaction.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, // Return the updated document
//       runValidators: true // Run schema validators on update
//     });

//     res.status(200).json({ success: true, data: transaction });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(val => val.message);
//       return res.status(400).json({ success: false, error: messages });
//     } else {
//       res.status(500).json({ success: false, error: error.message });
//     }
//   }
// };

// // @desc    Delete a wallet transaction
// // @route   DELETE /api/wallet-transactions/:id
// // @access  Private
// const deleteWalletTransaction = async (req, res) => {
//   try {
//     const transaction = await WalletTransaction.findById(req.params.id);

//     if (!transaction) {
//       return res.status(404).json({ success: false, error: 'Transaction not found' });
//     }

//     await WalletTransaction.findByIdAndDelete(req.params.id);

//     res.status(200).json({ success: true, data: {} }); // Return empty object or a success message
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Get wallet transactions for a specific user
// // @route   GET /api/wallet-transactions/user/:userId
// // @access  Private (should be authenticated user fetching their own data)
// const getTransactionsForUser = async (req, res) => {
//   try {
//     const userId = req.params.userId; // Get user ID from URL parameter

//     // Build query to find transactions where the user is either the sender or receiver
//     const query = {
//       $or: [
//         { fromUser: userId },
//         { toUser: userId }
//       ]
//     };

//     // Find transactions, sort by creation date (newest first), and optionally populate user names
//     const transactions = await WalletTransaction.find(query)
//       .sort({ createdAt: -1 }) // Sort by createdAt descending (newest first)
//       .limit(10); // Limit to a reasonable number for recent activities, e.g., 10

//     // IMPORTANT: If you want 'fromUser.name' or 'toUser.name' in the frontend,
//     // you MUST populate them here. Make sure your User model is correctly defined.
//     // Example with populate:
//     // .populate('fromUser', 'name') // Only get the 'name' field from 'User' model
//     // .populate('toUser', 'name');  // Only get the 'name' field from 'User' model

//     res.status(200).json({ success: true, count: transactions.length, data: transactions });
//   } catch (error) {
//     console.error("Error fetching user transactions:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// module.exports = {
//   getAllWalletTransactions,
//   getWalletTransactionById,
//   createWalletTransaction,
//   updateWalletTransaction,
//   deleteWalletTransaction,
//   getTransactionsForUser,
// };
