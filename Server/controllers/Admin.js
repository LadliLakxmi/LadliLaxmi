const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const WithdrawRequest = require('../models/WithdrawRequest')
const WalletTransaction = require('../models/WalletTransaction');
const { generateOtp, sendOtpEmail } = require("../utils/mailSender");
require("dotenv").config();


// 1. Get all users (excluding password, with donations populated)
exports.getAllUsers = async (req, res) => {
  try {
    // 1. Fetch all users from the database, populating their received donations
    //    The .select('-password') part ensures that sensitive password hashes are not sent to the client.
    const users = await User.find().select('-password').populate('donationsReceived');

    // 2. Map over the fetched users to calculate the total income for each one
    const usersWithIncome = users.map(user => {
      let totalIncome = 0;

      // 3. Check if the user has received any donations
      if (user.donationsReceived && user.donationsReceived.length > 0) {
        // 4. Use the reduce method to sum up the amounts of all completed donations
        totalIncome = user.donationsReceived.reduce((sum, donation) => {
          // You can adjust the status check here based on your logic (e.g., "completed", "paid", etc.)
          // The `!donation.status` check assumes that donations without a status are also considered complete.
          if (donation.status === "completed" || !donation.status) {
            return sum + donation.amount;
          }
          return sum; // If the donation is not completed, don't add its amount to the sum
        }, 0);
      }

      // 5. Convert the Mongoose document to a plain JavaScript object
      //    Then, add the calculated totalIncome property to it.
      const userObject = user.toObject(); 
      userObject.totalIncome = totalIncome;

      // 6. Return the new object for the `usersWithIncome` array
      return userObject;
    });
    
    // 7. Log the result to the console for debugging
    // console.log(usersWithIncome);

    // 8. Send the final array of user objects with their total income as a JSON response
    res.json({ users: usersWithIncome });
  } catch (err) {
    // 9. Log the error to the server console for debugging
    console.error('Error fetching users and calculating income:', err);
    
    // 10. Send a 500 status code with an error message to the client
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

// // 5. Update a user by ID (Admin only) - This remains the target for the PUT request
// exports.updateUserByAdmin = async (req, res) => {
//   try {
//     const { id } = req.params; // User ID to update (obtained from frontend after email lookup)
//     const updates = req.body; // Data to update

//     // If password is being updated, hash it before saving
//     if (updates.password) {
//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(updates.password, salt);
//     }
//     const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ success:true , message: 'User updated successfully', user });
//   } catch (err) {
//     console.error("Error updating user:", err);
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ message: err.message });
//     }
//     res.status(500).json({ error: 'Error updating user' });
//   }
// };

// exports.updateUserByAdmin = async (req, res) => {
//   try {
//     const adminUserId = req.user.id; // Admin ID because only admin can access this route
//     const adminUser = await User.findById(adminUserId);
//     if (!adminUser || adminUser.role !== 'Admin') {
//       return res.status(403).json({ message: 'Unauthorized: Only admin can update users' });
//     }

//     // Store update data temporarily in request or client (better client)
//     // For this example, client should send updatePayload again after OTP verification

//     // Generate OTP for admin verification
//     const plainOtp = generateOtp();
//     const hashedOtp = await bcrypt.hash(plainOtp, 10);
//     const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
//     const otpExpires = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

//     // Save OTP & expiry on admin record
//     adminUser.otp = hashedOtp;
//     adminUser.otpExpires = otpExpires;
//     await adminUser.save();

//     // Send OTP to admin's email
//     try {
//       await sendOtpEmail(adminUser.email, plainOtp);
//     } catch (err) {
//       console.error('Failed to send OTP email to admin:', err);
//       return res.status(500).json({ message: 'Failed to send OTP email to admin' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'OTP sent to admin email. Verify OTP to complete update.',
//       requiresOtpVerification: true,
//       adminUserId: adminUser._id, // Provide admin ID for verification step
//       targetUserId: req.params.id, // Pass target user ID to frontend for OTP verify step
//     });
//   } catch (error) {
//     console.error('Error sending OTP for user update:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.verifyAdminUpdateOtp = async (req, res) => {
//   try {
//     const { adminUserId, otp, targetUserId, updatePayload } = req.body;
//     if (!adminUserId || !otp || !targetUserId || !updatePayload) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const adminUser = await User.findById(adminUserId).select('+otp +otpExpires');
//     if (!adminUser || adminUser.role !== 'Admin') {
//       return res.status(403).json({ message: 'Unauthorized: Only admin can verify OTP' });
//     }

//     if (!adminUser.otp || !adminUser.otpExpires) {
//       return res.status(400).json({ message: 'No OTP found or expired' });
//     }

//     if (adminUser.otpExpires < new Date()) {
//       // Clear expired OTP info
//       adminUser.otp = undefined;
//       adminUser.otpExpires = undefined;
//       await adminUser.save();
//       return res.status(400).json({ message: 'OTP expired. Please request new OTP.' });
//     }

//     const otpMatch = await bcrypt.compare(otp, adminUser.otp);
//     if (!otpMatch) {
//       return res.status(401).json({ message: 'Invalid OTP' });
//     }

//     // OTP valid - clear it
//     adminUser.otp = undefined;
//     adminUser.otpExpires = undefined;
//     await adminUser.save();

//     // Hash password if included
//     if (updatePayload.password) {
//       const salt = await bcrypt.genSalt(10);
//       updatePayload.password = await bcrypt.hash(updatePayload.password, salt);
//     }

//     // Apply the update to the target user
//     const updatedUser = await User.findByIdAndUpdate(targetUserId, updatePayload, {
//       new: true,
//       runValidators: true,
//     }).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User to update not found' });
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'User updated successfully after OTP verification',
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error('Error verifying OTP and updating user:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



// 6. Get all wallet transactions with user details

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // User ID to update
    const { adminPassword, ...updates } = req.body; // Get admin password and update fields

    // 1. Find the current admin user (assumes authentication middleware sets req.user.id)
    const adminId = req.user.id;
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found or not authenticated.' });
    }

    // 2. Check admin password validity
    const isPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect admin password. Update denied.' });
    }

    // 3. If admin's password is valid, process the update (including hashing a new password, if provided)
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ success: true, message: 'User updated successfully', user });
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
