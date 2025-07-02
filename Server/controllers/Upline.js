const LEVEL_FLOW = {
  1: { amount: 400 },
  2: { amount: 500 },
  3: { amount: 1000 },
  4: { amount: 2000 },
  5: { amount: 4000 },
  6: { amount: 8000 },
  7: { amount: 16000 },
  8: { amount: 32000 },
  9: { amount: 64000 },
  10: { amount: 128000 },
  11: { amount: 256000 }, // Assuming this level also has an 'amount' even if it's the last
};

const User = require('../models/User'); // Your User model

exports.getUplineBeneficiaries = async (req, res) => {
  try {
    const userId = req.params.id; // User for whom we need uplines

    // Find the user to get their immediate referrer
    let currentUser = await User.findById(userId).select('referredBy');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    let currentReferrerId = currentUser.referredBy; // Get the ID of the direct referrer
    let uplinesFound = [];
    let levelsToTraverse = 11; // Fixed to 10 levels
    let currentLevelInChain = 1; // Represents the position in the upline chain (1st upline, 2nd upline, etc.)

    while (currentReferrerId && levelsToTraverse > 0) {
      const referrerUser = await User.findOne({ referralCode: currentReferrerId })
        .select('name email currentLevel referredBy') // Select 'referredBy' to continue traversal
        .lean(); // Use .lean() for performance

      if (!referrerUser) {
        console.warn(`Referrer with ID ${currentReferrerId} not found or chain broken for user ${userId}.`);
        break; // Break the loop if a referrer is not found
      }

      // Determine the upgrade cost based on the upline's position in the chain
      // If currentLevelInChain is 1, it's the first upline, so use LEVEL_FLOW[1].amount, etc.
      const upgradeCostForThisUplineLevel = LEVEL_FLOW[currentLevelInChain]
        ? LEVEL_FLOW[currentLevelInChain].amount
        : null; // Or handle default if level doesn't exist in LEVEL_FLOW

      uplinesFound.push({
        _id: referrerUser._id,
        name: referrerUser.name,
        email: referrerUser.email,
        uplineLevel: currentLevelInChain, // This is their position in the chain from the upgrading user
        currentLevelOfUpline: referrerUser.currentLevel, // Their own current upgrade level (useful for user info)
        upgradeCostAssociated: upgradeCostForThisUplineLevel, // The 'amount' from LEVEL_FLOW corresponding to their upline level
      });

      currentReferrerId = referrerUser.referredBy; // Move up to the next referrer
      levelsToTraverse--;
      currentLevelInChain++;
    }

    res.status(200).json({
      success: true,
      data: uplinesFound
    });

  } catch (error) {
    console.error("Error fetching upline beneficiaries:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};
