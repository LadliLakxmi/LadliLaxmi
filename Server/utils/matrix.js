// const User = require("../models/User");

// // BFS to find available matrix slot
// const findMatrixSlot = async (referrerId) => {
//   if (!referrerId) return null;

//   const rootUser = await User.findById(referrerId).exec(); // Fetch full user document
//   if (!rootUser) return null;

//   const queue = [rootUser];

//   while (queue.length > 0) {
//     const current = queue.shift();

//     // Ensure matrixChildren is an array
//     if (!Array.isArray(current.matrixChildren)) current.matrixChildren = [];

//     if (current.matrixChildren.length < 2) {
//       return current;
//     }

//     for (let childId of current.matrixChildren) {
//       const child = await User.findById(childId).exec();
//       if (child) queue.push(child);
//     }
//   }

//   return null; // No available slot found
// };

// module.exports = { findMatrixSlot };

const User = require("../models/User");

// BFS to find available matrix slot under referrer subtree
const findMatrixSlot = async (referrerId) => {
  if (!referrerId) return null;

  const rootUser = await User.findById(referrerId).exec(); // Fetch full user document
  if (!rootUser) {
    console.log(`Referrer with ID ${referrerId} not found.`);
    return null;
  }

  const queue = [rootUser];
  console.log(`Starting BFS from referrer: ${rootUser.name} (${rootUser._id})`);

  while (queue.length > 0) {
    const current = queue.shift();
    console.log(`Checking user: ${current.name} (${current._id}) with matrixChildren count: ${current.matrixChildren.length}`);

    // Ensure matrixChildren is an array
    if (!Array.isArray(current.matrixChildren)) current.matrixChildren = [];

    // If current has less than 2 children, return current as available slot
    if (current.matrixChildren.length < 2) {
      console.log(`Slot found at user: ${current.name} (${current._id})`);
      return current;
    }

    // Else enqueue children to check their slots
    for (let childId of current.matrixChildren) {
      const child = await User.findById(childId).exec();
      if (child) {
        console.log(`Enqueuing child user: ${child.name} (${child._id})`);
        queue.push(child);
      }
    }
  }

  console.log("No available slot found under the referrer subtree.");
  return null; // No available slot found
};

module.exports = { findMatrixSlot };

