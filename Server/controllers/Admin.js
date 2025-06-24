const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const WithdrawRequest = require('../models/WithdrawRequest')
// 1. Get all users (excluding password, with donations populated)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('donationsSent donationsReceived');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
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
    }).exec();

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch" });
  }
};
// 4. Get a single user by Email (Admin only)
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query; // Expect email as a query parameter
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required.' });
    }

    // First, find the user by their email. We're not populating referredBy/sponserdBy here
    // as their schema types might be String (e.g., referralCode or plain ID string)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('-password')
      .populate('donationsSent donationsReceived'); // Keep other necessary populations

    if (!user) {
      return res.status(404).json({ message: 'User not found with the provided email.' });
    }

    // Initialize variables for referredBy and sponserdBy emails/names
    let referredByEmail = null;
    let sponserdByEmail = null;
    let sponserdByName = null;

    // --- Logic to find the referredBy user's email ---
    // Assuming `user.referredBy` stores a referral code string.
    if (user.referredBy && typeof user.referredBy === 'string') {
      const referrerUser = await User.findOne({ referralCode: user.referredBy }).select('email name');
      if (referrerUser) {
        referredByEmail = referrerUser.email;
      }
    }

    // --- Logic to find the sponserdBy user's email ---
    // This handles cases where `sponserdBy` might be an ObjectId, a string ID, or a default string like "Admin".
    if (user.sponserdBy) {
      if (typeof user.sponserdBy === 'string' ) {
        // If sponserdBy is a string, assume it's a user ID and try to find that user.
        // We use a try-catch for `findById` in case the string isn't a valid ObjectId format.
        try {
          const sponsorUser = await User.findOne({ referralCode: user.sponserdBy }).select('email name');
          if (sponsorUser) {
            sponserdByEmail = sponsorUser.email;
            sponserdByName = sponsorUser.name;
          } else {
            // If ID is valid but no user found
            sponserdByEmail = 'User not found (invalid ID)';
            sponserdByName = 'Unknown';
          }
        } catch (idErr) {
          // Catch error if sponserdBy string is not a valid MongoDB ObjectId
          console.warn(`sponserdBy value "${user.sponserdBy}" is not a valid ObjectId format.`);
          sponserdByEmail = 'N/A (Invalid ID format)';
          sponserdByName = 'Unknown';
        }
      } else if (typeof user.sponserdBy === 'object' && user.sponserdBy._id) {
          // This case handles if `sponserdBy` was already defined as a `ref` in your User schema
          // and was successfully populated in the initial `User.findOne` call.
          // (Though in the provided code, it wasn't explicitly populated).
          sponserdByEmail = user.sponserdBy.email || 'N/A';
          sponserdByName = user.sponserdBy.name || 'N/A';
      } else if (user.sponserdBy === 'Admin') {
          // Handle the specific "Admin" string case
          sponserdByEmail = 'Admin (Default)';
          sponserdByName = 'Admin';
      }
    }

    // Construct the response object, converting the Mongoose document to a plain object first.
    const responseUser = {
      ...user.toObject(), // Convert Mongoose document to a plain JS object to add properties
      referredByEmail: referredByEmail,
      sponserdByEmail: sponserdByEmail,
      sponserdByName: sponserdByName, // Optionally include sponsor name
    };

    res.json(responseUser); // Return the enhanced user object
  } catch (err) {
    console.error("Error fetching user by email:", err);
    res.status(500).json({ error: 'Error fetching user by email.' });
  }
};

// 5. Update a user by ID (Admin only) - This remains the target for the PUT request
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // User ID to update (obtained from frontend after email lookup)
    const updates = req.body; // Data to update

    // If password is being updated, hash it before saving
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Handle bankDetails specifically if it's in the updates to ensure it's overwritten/merged
    // Mongoose's findByIdAndUpdate with default behavior often merges top-level fields.
    // If bankDetails is sent as a whole object, it will typically replace the existing one.
    // For specific sub-document updates, you might need $set: { 'bankDetails.accountNumber': 'newVal' }
    // but sending the whole bankDetails object from frontend works if it's complete.

    //  // Handle bankDetails separately
    // if (updateData.bankDetails) {
    //   await User.findByIdAndUpdate(
    //     id,
    //     { $set: { bankDetails: updateData.bankDetails } },
    //     { new: true, runValidators: true }
    //   );
    //   delete updateData.bankDetails;
    // }

    // const updatedUser = await User.findByIdAndUpdate(
    //   id,
    //   updateData,
    //   { new: true, runValidators: true }
    // ).select('-password');

    // res.status(200).json({
    //   success: true,
    //   user: updatedUser
    // });
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success:true , message: 'User updated successfully', user });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ error: 'Error updating user' });
  }
};


