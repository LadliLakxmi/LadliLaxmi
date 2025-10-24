// // controllers/downlineController.js
// import User from "../models/User.js";

// export const getDownlineStatus = async (req, res) => {
//   try {
//     const userId = req.user.id; // assuming you have JWT auth
//     const matrixWidth = 2; // change this as per your matrix structure
//     const maxLevels = 10; // how deep you want to go

//     const rootUser = await User.findById(userId).populate("matrixChildren");
//     if (!rootUser) return res.status(404).json({ message: "User not found" });

//     // BFS traversal to count downlines level by level
//     let currentLevelUsers = [rootUser];
//     const result = [];

//     for (let level = 1; level <= maxLevels; level++) {
//       const nextLevelUsers = [];

//       for (const user of currentLevelUsers) {
//         const populatedUser = await User.findById(user._id).populate("matrixChildren");
//         nextLevelUsers.push(...populatedUser.matrixChildren);
//       }

//       const actualCount = nextLevelUsers.length;
//       const possibleCount = Math.pow(matrixWidth, level);
//       result.push({
//         level,
//         actualCount,
//         possibleCount,
//         message: `You have ${actualCount} out of ${possibleCount} members at Level ${level}`,
//       });

//       currentLevelUsers = nextLevelUsers;
//     }

//     res.json({ downlineStatus: result });
//   } catch (error) {
//     console.error("Error fetching downline:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// controllers/downlineController.js
// controllers/downlineController.js
import User from "../models/User.js";

export const getDownlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const matrixWidth = 2;
    const maxLevels = 10;

    const rootUser = await User.findById(userId).populate("matrixChildren");
    if (!rootUser) return res.status(404).json({ message: "User not found" });

    // BFS Queue → Depth based traversal
    let queue = rootUser.matrixChildren.map(u => ({ user: u, level: 1 }));

    const levelData = {}; // level → { actualCount }

    while (queue.length > 0) {
      const { user, level } = queue.shift();

      if (level > maxLevels) continue;

      // Count user at its level
      if (!levelData[level]) {
        levelData[level] = { actualCount: 0 };
      }
      levelData[level].actualCount++;

      // Populate children & push to BFS
      await user.populate("matrixChildren");
      user.matrixChildren.forEach(child => {
        queue.push({ user: child, level: level + 1 });
      });
    }

    // Prepare final formatted result
    const result = [];
    for (let level = 1; level <= maxLevels; level++) {
      const actualCount = levelData[level]?.actualCount || 0;
      const possibleCount = Math.pow(matrixWidth, level);
      const inactiveCount = possibleCount - actualCount; // ✅ New logic

      result.push({
        level,
        actualCount,
        possibleCount,
        inactiveCount,
        message: `Level ${level}: ${actualCount} filled, ${inactiveCount} empty (out of ${possibleCount} possible)`
      });
    }

    res.json({ downlineStatus: result });

  } catch (error) {
    console.error("Error fetching downline:", error);
    res.status(500).json({ message: "Server error" });
  }
};
