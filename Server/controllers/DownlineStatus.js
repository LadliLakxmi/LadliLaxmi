const User = require("../models/User");
const express = require("express");
exports.getDownlineStatus = async (req, res) => {
  try {
    const userId = req.user.id; // assuming JWT auth
    const matrixWidth = 2; // adjust as matrix structure
    const maxLevels = 11; // max depth to show stats

    // Recursive function to collect all downline users
    async function getAllDescendants(user) {
      await user.populate("matrixChildren");
      let allChildren = user.matrixChildren || [];
      for (const child of user.matrixChildren) {
        const descendants = await getAllDescendants(child);
        allChildren = allChildren.concat(descendants);
      }
      return allChildren;
    }

    const rootUser = await User.findById(userId);
    if (!rootUser) return res.status(404).json({ message: "User not found" });

    // Get all downline users in one flat list
    const allDownlineUsers = await getAllDescendants(rootUser);

    // Aggregate counts by current level
    const levelCounts = {};
    for (const user of allDownlineUsers) {
      const level = user.currentLevel || 1; // default level 1 if not set
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    }

    // Construct result array up to maxLevels
    const result = [];
    for (let level = 1; level <= maxLevels; level++) {
      const actualCount = levelCounts[level] || 0;
      const possibleCount = Math.pow(matrixWidth, level);
      result.push({
        level,
        actualCount,
        possibleCount,
        message: `You have ${actualCount} out of ${possibleCount} members at Level ${level}`,
      });
    }

    res.json({ downlineStatus: result });
  } catch (error) {
    console.error("Error fetching downline:", error);
    res.status(500).json({ message: "Server error" });
  }
};
