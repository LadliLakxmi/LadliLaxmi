const User = require("../models/User");

const buildMatrixHierarchy = async (userId, visited = new Set(), depth = 0, maxDepth = 5) => {
  if (visited.has(userId.toString()) || depth > maxDepth) return null;

  visited.add(userId.toString());

  const user = await User.findById(userId)
    .populate("matrixChildren", "name email referralCode currentLevel")
    .populate("walletTransactions")
    .lean();

  if (!user) return null;

  const node = {
    ...user,
    matrixChildren: []
  };

  for (const child of user.matrixChildren || []) {
    const childNode = await buildMatrixHierarchy(child._id, visited, depth + 1, maxDepth);
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
      .populate("donationsReceived")
      .populate("walletTransactions")
      .lean();

    if (!rootUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // let hierarchyRoot;
    // if (rootUser.referredBy) {
    //   // Find the topmost parent (user with no referrer)
    //   let topParent = rootUser;
    //   while (topParent.referredBy) {
    //     topParent = await User.findOne({ referralCode: topParent.referredBy })
    //         .populate('referredBy', '_id referralCode')
    //         .lean();
    //   }
    //   hierarchyRoot = await buildMatrixHierarchy(topParent._id);
    // } else {
    //   // Current user is the top of hierarchy
    //   hierarchyRoot = await buildMatrixHierarchy(userId);
    // }
    const hierarchyRoot = await buildMatrixHierarchy(userId);
    if (!hierarchyRoot) {
      return res.status(404).json({ message: "Hierarchy data not available." });
    }

    res.status(200).json({ profile: hierarchyRoot });
  } catch (error) {
    console.error("Error fetching profile:", error);
    
    // More specific error message for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid user ID format. Please provide a valid MongoDB ObjectId." 
      });
    }
    
    res.status(500).json({ message: "Server error." });
  }
};