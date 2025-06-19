// Example backend controller function for upline beneficiaries, now using 'referredBy'
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
        let levelsToTraverse = 10; // Fixed to 10 levels
        let currentLevelInChain = 1; // Represents the position in the upline chain (1st upline, 2nd upline, etc.)

        while (currentReferrerId && levelsToTraverse > 0) {
            const referrerUser = await User.findOne({referralCode : currentReferrerId})
                                        .select('name email currentLevel referredBy') // Select 'referredBy' to continue traversal
                                        .lean(); // Use .lean() for performance
            if (!referrerUser) {
                console.warn(`Referrer with ID ${currentReferrerId} not found or chain broken for user ${userId}.`);
                // Decide how to handle a broken chain:
                // 1. Break the loop and return what's found so far.
                // 2. Add a placeholder for "Missing Upline".
                break;
            }

            uplinesFound.push({
                _id: referrerUser._id,
                name: referrerUser.name,
                email: referrerUser.email,
                uplineLevel: currentLevelInChain, // This is their position in the chain from the upgrading user
                currentLevelOfUpline: referrerUser.currentLevel, // Their own current upgrade level (useful for user info)
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