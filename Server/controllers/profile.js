const User = require("../models/User");
const buildMatrixHierarchy2 = async (userId, visited = new Set()) => {
  if (visited.has(userId.toString())) return null;

  visited.add(userId.toString());

  const user = await User.findById(userId)
    .populate("matrixChildren", "name email referralCode currentLevel")
    .populate("walletTransactions")
    .lean();

  if (!user) return null;

  const node = {
    ...user,
    matrixChildren: [],
  };

  for (const child of user.matrixChildren || []) {
    const childNode = await buildMatrixHierarchy2(child._id, visited);
    if (childNode) {
      node.matrixChildren.push(childNode);
    }
  }

  return node;
};

const buildMatrixHierarchy = async (
  userId,
  visited = new Set(),
  depth = 0,
  maxDepth = 5
) => {
  if (visited.has(userId.toString()) || depth > maxDepth) return null;

  visited.add(userId.toString());

  const user = await User.findById(userId)
    .populate("matrixChildren", "name email referralCode currentLevel")
    .populate({
      path: "walletTransactions", // This is the field on the User model that references WalletTransaction documents
      populate: [
        // Use an array for multiple nested populations, or a single object if only one
        {
          path: "fromUser", // Populate the 'fromUser' field within each WalletTransaction
          select: "name email ", // Select relevant fields from the User model for 'fromUser'
        },
        {
          path: "toUser", // Populate the 'toUser' field within each WalletTransaction
          select: "name email ", // Select relevant fields from the User model for 'toUser'
        },
      ],
    })
    .lean();

  if (!user) return null;

  const node = {
    ...user,
    matrixChildren: [],
  };

  for (const child of user.matrixChildren || []) {
    const childNode = await buildMatrixHierarchy(
      child._id,
      visited,
      depth + 1,
      maxDepth
    );
    if (childNode) {
      node.matrixChildren.push(childNode);
    }
  }

  return node;
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const rootUser = await User.findById(userId)
      .populate("directReferrals", "name email")
      .populate("matrixChildren", "name email referralCode currentLevel")
      .populate("donationsSent")
      .populate({
        path: "donationsReceived", // Populate the donationsReceived array
        select: "amount status", // Select only the 'amount' and 'status' fields
      })
      .populate({
        path: "walletTransactions", // This is the field on the User model that references WalletTransaction documents
        populate: [
          // Use an array for multiple nested populations, or a single object if only one
          {
            path: "fromUser", // Populate the 'fromUser' field within each WalletTransaction
            select: "name email ", // Select relevant fields from the User model for 'fromUser'
          },
          {
            path: "toUser", // Populate the 'toUser' field within each WalletTransaction
            select: "name email ", // Select relevant fields from the User model for 'toUser'
          },
        ],
      })
      .lean();

    if (!rootUser) {
      return res.status(404).json({ message: "User not found." });
    }
    // Calculate total income from populated donationsReceived
    let totalIncome = 0;

    if (rootUser.donationsReceived && rootUser.donationsReceived.length > 0) {
      totalIncome = rootUser.donationsReceived.reduce((sum, donation) => {
        // Ensure only 'completed' donations count towards income, if applicable
        // You might want to adjust this based on your business logic
        if (donation.status === "completed" || !donation.status) {
          // Assuming no status means it's complete
          return sum + donation.amount;
        }
        return sum;
      }, 0);
    }

    const hierarchyRoot = await buildMatrixHierarchy(userId);
    if (!hierarchyRoot) {
      return res.status(404).json({ message: "Hierarchy data not available." });
    }
    // Attach totalIncome to the root of the hierarchy object
    // You can attach it to `hierarchyRoot` directly or to `rootUser` before creating `hierarchyRoot`
    // For simplicity and clarity, let's add it to the `profile` object we send back.
    const profileWithIncome = {
      ...hierarchyRoot, // This contains the nested matrixChildren structure
      totalIncome: totalIncome, // Add the calculated total income
      // You might want to include other top-level details from rootUser here if not already in hierarchyRoot
      // e.g., email, phone, referralCode if buildMatrixHierarchy doesn't include them for the root
      email: rootUser.email,
      phone: rootUser.phone,
      referralCode: rootUser.referralCode,
      // ... any other top-level fields you explicitly need for the main profile card
    };

    res.status(200).json({ profile: profileWithIncome });
    // res.status(200).json({ profile: hierarchyRoot });
  } catch (error) {
    console.error("Error fetching profile:", error);

    // More specific error message for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({
        message:
          "Invalid user ID format. Please provide a valid MongoDB ObjectId.",
      });
    }

    res.status(500).json({ message: "Server error." });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    // Assuming req.user.id is set by your 'protect' middleware
    const userId = req.user.id;
    const { accountHolder, accountNumber, ifscCode, bankName, phoneNumber } =
      req.body;

    // Find the user and update their bankDetails
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the bankDetails sub-document
    user.bankDetails = {
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
    };
    user.phone = phoneNumber;
    await user.save(); // Save the updated user document

    res.status(200).json({
      message: "Bank details updated successfully!",
      bankDetails: user.bankDetails, // Send back the updated bank details
    });
  } catch (error) {
    console.error("Error updating bank details:", error);
    res
      .status(500)
      .json({ message: "Server error: Could not update bank details." });
  }
};

// --- NEW CONTROLLER: Update User Profile ---
exports.updateProfile = async (req, res) => {
  try {
    // Assuming req.user.id is set by your authentication middleware (e.g., 'protect')
    // This ensures only the logged-in user can update their own profile.
    const userId = req.user.id;
    const { name, email, phone, panCard } = req.body;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Input validation (optional but recommended for robust APIs)
    if (!name && !email && !phone && panCard) {
      return res
        .status(400)
        .json({ success: false, message: "No fields provided for update." });
    }

    // Check for uniqueness of email and phone if they are being updated
    // and if the new value is different from the current value.
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res
          .status(400)
          .json({
            success: false,
            message: "This email is already in use by another account.",
          });
      }
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        return res
          .status(400)
          .json({
            success: false,
            message: "This phone number is already in use by another account.",
          });
      }
      user.phone = phone;
    }
    if (panCard && panCard !== user.panCard) {
      const existingPanUser = await User.findOne({ panCard });
      if (existingPanUser) {
        return res
          .status(400)
          .json({
            success: false,
            message: "This pan number is already in use by another account.",
          });
      }
      user.panCard = panCard;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Save the updated user document
    await user.save();

    // Respond with success and the updated user data (or relevant subset)
    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        panCard: user.panCard,
        // You might want to return other fields here, but exclude sensitive ones like password
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    // Handle validation errors or other server errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Server error: Could not update profile.",
      });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const userId = req.params.id;

    const rootUser = await User.findById(userId)
      .populate("directReferrals", "name email phone referralCode currentLevel")
      .populate("matrixChildren", "name email referralCode currentLevel")
      .lean();

    if (!rootUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const hierarchyRoot2 = await buildMatrixHierarchy2(userId);
    if (!hierarchyRoot2) {
      return res.status(404).json({ message: "Hierarchy data not available." });
    }
    // Attach totalIncome to the root of the hierarchy object
    // You can attach it to `hierarchyRoot` directly or to `rootUser` before creating `hierarchyRoot`
    // For simplicity and clarity, let's add it to the `profile` object we send back.
    const Team = {
      ...hierarchyRoot2, // This contains the nested matrixChildren structure
      email: rootUser.email,
      directReferrals: rootUser.directReferrals,
      phone: rootUser.phone,
      referralCode: rootUser.referralCode,
      // ... any other top-level fields you explicitly need for the main profile card
    };

    res.status(200).json({ Team: Team });
    // res.status(200).json({ profile: hierarchyRoot });
  } catch (error) {
    console.error("Error fetching Team:", error);

    // More specific error message for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({
        message:
          "Invalid user ID format. Please provide a valid MongoDB ObjectId.",
      });
    }

    res.status(500).json({ message: "Server error." });
  }
};
