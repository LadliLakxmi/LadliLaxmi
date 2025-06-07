const express = require("express");
const { isAdmin, auth } = require("../middleware/auth");
const WithdrawRequest = require("../models/WithdrawRequest");
const {
  getAllUsers,
  getUserCount,
  deleteUser,
  withdrawals,
} = require("../controllers/Admin");
const router = express.Router();
// Get total user count
router.get("/getalluserCount", auth, isAdmin, getUserCount);

// Get all users
router.get("/getalluser", auth, isAdmin, getAllUsers);

// Delete user by ID
router.delete("/deleteUser/:id", auth, isAdmin, deleteUser);
router.get("/withdrawals", auth, isAdmin, withdrawals);

module.exports = router;
