const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Ensure process.env.JWT_SECRET is set in your .env file
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role,name: user.name, 
      referralCode: user.referralCode },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public

exports.register = async (req, res) => {
  const { name, email, password, phone,confirmPassword, referredBy } = req.body; // referredBy will be the referralCode

  try {
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }
    // --- NEW: Check if user already exists by email OR phone ---
    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists with this email." });
      }
      if (existingUser.phone === phone) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists with this phone number." });
      }
    }
    let sponser = null;

    if(referredBy){
      sponser = await User.findOne({ referralCode: referredBy });
      if (!sponser) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid referrer code provided." });
      }
      if (sponser.currentLevel === 0) { // Sponsor inactive, cannot refer
        return res.status(400).json({ success: false, message: "Sponsor is inactive and cannot refer others. Please use a different referral code." });
      }
    }else{
      sponser = await User.findOne({ referralCode: "R7079AEU" }); 
      if (!sponser) {
        // This is a critical error if no admin exists to place unreferred users
        return res.status(500).json({
          success: false,
          message:
            "No company id found to place unreferred signups. Please ensure an admin account exists.",
        });
      }
    }
    
   

    const hashed = await bcrypt.hash(password, 10);
    // Generate a unique referral code for the new user based on their _id
    // This will be set by the schema's default function, but ensure _id is available first
    // For now, let's keep the simple unique code generation here, or rely on schema default
    const newReferralCode =
      "L" +
      Date.now().toString().slice(-4) +
      Math.random().toString(36).substring(2, 5).toUpperCase(); // More unique

    const newUser = new User({
      name,
      email,
      password: hashed,
      referralCode: newReferralCode, // Generated code for new user
      sponserdBy: sponser.referralCode,
      phone, // Include phone in response
      currentLevel: 0, // Initial level
    });

    await newUser.save(); // Save the new user first to get their _id
    sponser?.directReferrals.push(newUser._id);
    await sponser.save();
    
    res.status(201).json({
      success: true,
      _id: newUser._id,
      email: newUser.email, // Include email in response
      name: newUser.name, // Include name in response
      referralCode: newUser.referralCode, // Include new user's referral code
      phone: newUser.phone,
      token: generateToken(newUser._id), // Use newUser._id for token generation
      message: "Registration successful. Please activate your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration. Please try again later.",
    });
  }
};




exports.login = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be email or phone

  try {
    // Check if identifier or password is missing
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: `Please fill up all the required fields`,
      });
    }

    let user;

    // Determine if the identifier is likely an email or a phone number
    // A simple check: if it contains '@', assume it's an email. Otherwise, assume phone.
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      // Basic phone number validation (e.g., all digits)
      if (!/^\d+$/.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: "Invalid identifier format. Please use a valid email or phone number.",
        });
      }
      user = await User.findOne({ phone: identifier });
    }

    // If user not found by either email or phone
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email/phone number or password" });
    }

    // Validate password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email/phone number or password" });
    }
    // --- Regular Login for Non-Admin Roles ---
    const token = generateToken(user);
    // user.token = token; // This line is not needed if you're sending the token in the response and not saving it to DB
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
      // sameSite: 'Lax', // Adjust as needed for CORS
    };

    res
      .cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          sponserdBy: user.sponserdBy,
          referredBy: user.referredBy,
          currentLevel: user.currentLevel,
          walletBalance: user.walletBalance,
          referralCode: user.referralCode,
          role: user.role,
          token:token,
        },
        message: "User login successful",
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};


// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for admin login
// @access  Public (but tied to a specific user)
exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required.",
      });
    }

    // Select OTP fields for verification.
    // If you hashed the OTP, you'd fetch the hashed OTP here using .select('+otp +otpExpires')
    const user = await User.findById(userId).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "OTP verification is only required for admin users." });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ success: false, message: "No OTP found or it has expired. Please try logging in again." });
    }

   // --- Compare the received PLAIN OTP with the stored HASHED OTP ---
        const otpMatch = await bcrypt.compare(otp, user.otp);
        if (!otpMatch) {
            return res.status(401).json({ success: false, message: "Invalid OTP. Please try again." });
        }

        if (user.otpExpires < new Date()) {
            // Clear OTP fields after expiry
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ success: false, message: "OTP has expired. Please log in again to receive a new OTP." });
        }

        // OTP is valid and not expired, clear it from DB for security
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
    // Generate token and complete login for admin
    const token = generateToken(user);
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'Lax',
    };

    res
      .cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          sponserdBy: user.sponserdBy,
          referredBy: user.referredBy,
          currentLevel: user.currentLevel,
          walletBalance: user.walletBalance,
          referralCode: user.referralCode,
          role: user.role,
          token:token,
        },
        message: "Admin login successful with OTP verification.",
      });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};



exports.changePassword = async (req, res) => {
  try {
    // Ensure req.user.id is populated by a preceding authentication middleware (like verifyToken)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    const userDetails = await User.findById(req.user.id);
    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const { oldPassword, newPassword, confirmNewPassword } = req.body; // Added confirmNewPassword

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm new password do not match.",
      });
    }

    // Validate old password
    const match = await bcrypt.compare(oldPassword, userDetails.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "The old password is incorrect" });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10); // Hash the new password
    // Only update the 'password' field, 'confirmPassword' is for client-side validation
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashed }, // Only update password
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

//  logout controller
exports.logout = async (req, res) => {
  try {
    // Clear the cookie that stores the authentication token
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(" Error in logout:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};
exports.Referraluser = async (req, res) => {
  const { code } = req.params;

  try {
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required.",
      });
    }

    const user = await User.findOne({ referralCode: code });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Referrer not found.",
      });
    }

    // Return just the user name (you can add more info if needed)
    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching referral user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching referral user.",
    });
  }
};
