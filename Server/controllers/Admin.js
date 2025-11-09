const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const WithdrawRequest = require('../models/WithdrawRequest')
const WalletTransaction = require('../models/WalletTransaction');
require("dotenv").config();


// 1. Get all users (excluding password, with donations populated)
exports.getAllUsers = async (req, res) => {
  try {
    // Parse and validate pagination parameters
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 200;
    const skip = (page - 1) * limit;

    // Get search term and prepare filter
    const search = req.query.search ? req.query.search.trim() : "";
    let filter = {};
    if (search !== "") {
      const regex = new RegExp(search, "i"); // case-insensitive regex
      filter = {
        $or: [
          { name: regex },
          { email: regex },
          { referralCode: regex },
        ],
      };
    }

    // Get total count of matching documents for pagination
    const totalCount = await User.countDocuments(filter);

    // Query users with filter, pagination and populate donationsReceived
    const users = await User.find(filter)
      .select("-password") // Exclude sensitive fields
      .populate("donationsReceived") // Populate donationsReceived
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate totalIncome for each user
    const usersWithIncome = users.map((user) => {
      let totalIncome = 0;
      if (user.donationsReceived && user.donationsReceived.length > 0) {
        totalIncome = user.donationsReceived.reduce((sum, donation) => {
          if (donation.status === "completed" || !donation.status) {
            return sum + donation.amount;
          }
          return sum;
        }, 0);
      }
      return {
        ...user,
        totalIncome,
      };
    });

    // Send paginated users with total count metadata
    res.json({
      users: usersWithIncome,
      totalCount,
      currentPage: page,
      pageSize: limit,
    });
  } catch (err) {
    console.error("Error fetching users and calculating income:", err);
    res.status(500).json({ error: "Error fetching users." });
  }
};


// 2. Get total count of users
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    res.status(500).json({ error: 'Error counting users' });
  }
};

// 3. Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

exports.withdrawals = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find().populate({
      path: 'user',
      select: 'name email walletBalance bankDetails totalWithdrawn phone' ,
    })
    .sort({ createdAt: -1 })
    .exec();

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch" });
  }
};
// 4. Get a single user by Email (Admin only)
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('-password')
      .populate('donationsSent donationsReceived');

    if (!user) {
      return res.status(404).json({ message: 'User not found with the provided email.' });
    }

    let referredByEmail = null;
    let sponserdByEmail = null;
    let sponserdByName = null;

    if (user.referredBy && typeof user.referredBy === 'string') {
      const referrerUser = await User.findOne({ referralCode: user.referredBy }).select('email name');
      if (referrerUser) {
        referredByEmail = referrerUser.email;
      }
    }

    if (user.sponserdBy) {
      if (typeof user.sponserdBy === 'string') {
        try {
          const sponsorUser = await User.findOne({ referralCode: user.sponserdBy }).select('email name');
          if (sponsorUser) {
            sponserdByEmail = sponsorUser.email;
            sponserdByName = sponsorUser.name;
          } else {
            sponserdByEmail = 'User not found (invalid ID)';
            sponserdByName = 'Unknown';
          }
        } catch (idErr) {
          sponserdByEmail = 'N/A (Invalid ID format)';
          sponserdByName = 'Unknown';
        }
      } else if (typeof user.sponserdBy === 'object' && user.sponserdBy._id) {
        sponserdByEmail = user.sponserdBy.email || 'N/A';
        sponserdByName = user.sponserdBy.name || 'N/A';
      } else if (user.sponserdBy === 'Admin') {
        sponserdByEmail = 'Admin (Default)';
        sponserdByName = 'Admin';
      }
    }

    const responseUser = {
      ...user.toObject(),
      referredByEmail,
      sponserdByEmail,
      sponserdByName,
    };

    res.json(responseUser);
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ error: 'Error fetching user by email.' });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // User ID to update
    const { adminPassword, updationPassword, ...updates } = req.body; // Extract adminPassword and updationPassword


    // 1. Find the currently logged-in admin user (assumes auth middleware populates req.user.id)
    const adminId = req.user.id;
    const admin = await User.findById(adminId).select('+updationPassword');;

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found or not authenticated.' });
    }

    // 2. Verify admin password
    const isPasswordCorrect = await bcrypt.compare(adminPassword, admin.updationPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect admin password. Update denied.' });
    }

    // 3. If password update provided, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // 4. Handle updationPassword ONLY if the target user is admin
    // Get target user data to know role
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User to update not found.' });
    }
    if (targetUser.role === 'Admin') {
      if (updationPassword) {
        const salt = await bcrypt.genSalt(10);
        updates.updationPassword = await bcrypt.hash(updationPassword, salt);
      }
    }

    // 5. Update user with accumulated updates, excluding password fields that are empty
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update.' });
    }

    res.json({ success: true, message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ error: 'Error updating user' });
  }
};

exports.getAllWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate('fromUser', 'name email') // Populate the 'fromUser' field with 'name' and 'email'
      .populate('toUser', 'name email')   // Populate the 'toUser' field with 'name' and 'email'
      .sort({ createdAt: -1 })            // Sort by creation date, newest first
      .exec();

    // Check if any transactions were found
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No wallet transactions found.' });
    }

    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching wallet transactions:', err);
    res.status(500).json({ error: 'Error fetching wallet transactions.' });
  }
};



// ✅ Get all admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total registered users
    const totalUsers = await User.countDocuments();

    // Total active users (users whose currentLevel > 0)
    const totalActiveUsers = await User.countDocuments({ currentLevel: { $gt: 0 } });

    // Total approved withdraw amount
    const approvedWithdraws = await WithdrawRequest.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalWithdrawAmount: { $sum: "$amount" } } },
    ]);

    const totalWithdraw =
      approvedWithdraws.length > 0 ? approvedWithdraws[0].totalWithdrawAmount : 0;

    // Send response
    res.status(200).json({
      success: true,
      totalUsers,
      totalActiveUsers,
      totalWithdraw,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
    });
  }
};

// GET admin withdraw list (existing) - keep as is but DO NOT populate bankProof url to save time
// You probably already have this. Keep returning requests WITHOUT sending bankProof URL

// GET bank proof for a specific user (lazy-load when admin clicks "View Proof")
exports.getBankProofByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("bankDetails.bankProof bankProofVerified");
    if (!user) return res.status(404).json({ message: "User not found" });

    // DO NOT auto-show on list; return when requested
    return res.status(200).json({
      bankProof: user.bankDetails.bankProof || null,
      status: user.bankProofVerified || "",
    });
  } catch (err) {
    console.error("getBankProofByUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// PATCH admin verify/reject bank proof
exports.verifyBankProof = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // expected "verified" or "rejected"

    if (!["verified", "rejected"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bankProofVerified = action;
    await user.save();

    return res.status(200).json({ message: `Bank proof ${action} successfully.` });
  } catch (err) {
    console.error("verifyBankProof error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ✅ FETCH ALL USERS WHO UPLOADED BANK PROOF
exports.getAllBankProofs = async (req, res) => {
  try {
    const users = await User.find({
      "bankDetails.bankProof": { $exists: true, $ne: "" }
    }).select("name email phone bankDetails bankProofVerified");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No bank proofs found" });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      proofs: users.map(user => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bankDetails: user.bankDetails,
        proofUrl: user.bankDetails.bankProof,
        status: user.bankProofVerified || "pending",
      }))
    });

  } catch (err) {
    console.error("getAllBankProofs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};