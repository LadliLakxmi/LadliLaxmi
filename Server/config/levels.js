// config/level.js
// exports.LEVELS_CONFIG = {
//   1: { amount: 400, receiverShare: 300, sponsorShare: 100, description: "Level 1 Activation" },
//   2: { amount: 800, receiverShare: 700, sponsorShare: 100, description: "Level 2 Activation" },
//   3: { amount: 1600, receiverShare: 1500, sponsorShare: 100, description: "Level 3 Activation" },
//   // Add more levels here as needed
//   // Ensure receiverShare + sponsorShare = amount, or handle platform fee if applicable
// };

// config/level.js

exports.LEVELS_CONFIG = {
  1: { amount: 400, receiverShare: 300, sponsorShare: 100, description: "Level 1 Activation" },
  2: { amount: 500, receiverShare: 500, sponsorShare: 0, description: "Level 2 Activation" },
  3: { amount: 1000, receiverShare: 1000, sponsorShare: 0, description: "Level 3 Activation" },
  4: { amount: 2000, receiverShare: 2000, sponsorShare: 0, description: "Level 4 Activation" },
  5: { amount: 4000, receiverShare: 4000, sponsorShare: 0, description: "Level 5 Activation" },
  6: { amount: 8000, receiverShare: 8000, sponsorShare: 0, description: "Level 6 Activation" },
  7: { amount: 16000, receiverShare: 16000, sponsorShare: 0, description: "Level 7 Activation" },
  8: { amount: 32000, receiverShare: 32000, sponsorShare: 0, description: "Level 8 Activation" },
  9: { amount: 64000, receiverShare: 64000, sponsorShare: 0, description: "Level 9 Activation" },
  10: { amount: 128000, receiverShare: 128000, sponsorShare:0, description: "Level 10 Activation" },
  11: { amount: 256000, receiverShare: 256000, sponsorShare: 0, description: "Level 11 Activation" },
};

/*
Note:
- The 'amount' for each level is taken from the 'provide' value determined in the previous step (which was the per-member contribution from the 'Team' column in the image).
- The 'sponsorShare' is assumed to be a fixed 100 for all levels, following the pattern observed in your original LEVELS_CONFIG.
- The 'receiverShare' is calculated as 'amount - sponsorShare'.
- 'description' is a generic "Level X Activation".
*/