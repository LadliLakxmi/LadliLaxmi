// routes/walletTransactionRoutes.js
const { auth } = require("../middleware/auth");
const express = require('express');
const {
  getAllWalletTransactions,
  getWalletTransactionById,
  createWalletTransaction,
  updateWalletTransaction,
  deleteWalletTransaction,
  getTransactionsForUser,
} = require('../controllers/walletTransactionController');

const router = express.Router();
// // Apply auth middleware to all routes in this router
// router.use(auth);

// Define routes
router.route('/')
  .get(getAllWalletTransactions)
  .post(createWalletTransaction);

router.route('/:id')
  .get(getWalletTransactionById)
  .put(updateWalletTransaction)
  .delete(deleteWalletTransaction);

  // New route for user-specific transactions
router.route('/user/:userId') // Endpoint will be e.g., /api/wallet-transactions/user/60d0fe4f5311236168a109ca
  .get(getTransactionsForUser);

module.exports = router;