const express = require("express");
const { isAdmin, auth } = require("../middleware/auth");
const WithdrawRequest = require("../models/WithdrawRequest");
const {
  getAllUsers,
  getUserCount,
  deleteUser,
  withdrawals,
  getUserByEmail,
  updateUserByAdmin,
  getAllWalletTransactions,
  // verifyAdminUpdateOtp
} = require("../controllers/Admin");
const router = express.Router();
// Get total user count
router.get("/getalluserCount", auth, isAdmin, getUserCount);

// Get all users
router.get("/getalluser", auth, isAdmin, getAllUsers);

// NEW ROUTE: To fetch user by email
router.get("/users/by-email", auth, isAdmin, getUserByEmail);

// EXISTING ROUTE: To update user by ID (frontend will provide ID after fetching by email)
router.put("/users/:id", auth, isAdmin, updateUserByAdmin);
// router.post('/users/verify-otp', auth , isAdmin , verifyAdminUpdateOtp);

// Delete user by ID
router.delete("/deleteUser/:id", auth, isAdmin, deleteUser);
router.get("/withdrawals", auth, isAdmin, withdrawals);
router.get("/getalltransactions", auth, isAdmin, getAllWalletTransactions);

module.exports = router;
