// controllers/bankController.js

import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";

// ✅ Function to remove spaces & special chars from filename
function cleanFileName(originalName) {
  return originalName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

// ✅ Multer using memory, NOT saving to disk
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// 👉 Bank Proof Upload Controller
export const uploadBankProof = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (user.bankDetails.bankProof) {
      return res.status(400).json({
        success: false,
        message: "Bank proof already uploaded hai!",
      });
    }

    // ✅ COMPRESS image (max ~1MB)
    const compressedPath = `temp-${Date.now()}.jpg`;

    await sharp(req.file.buffer)
      .jpeg({ quality: 70 })
      .toFile(compressedPath);

    // ✅ Upload to cloudinary
    const result = await cloudinary.uploader.upload(compressedPath, {
      folder: "bankProofs",
    });

    // ✅ remove temporary file
    fs.unlinkSync(compressedPath);

    // user.bankDetails.bankProof = result.secure_url;
    user.bankDetails.bankProof = result.secure_url;
    user.bankProofVerified = "pending"; // ← important: admin will verify later
    await user.save();

    res.status(200).json({
      success: true,
      message: "Bank proof successfully upload ho gaya!",
      imageUrl: result.secure_url,
      status: user.bankProofVerified,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// // controllers/bankController.js

// import cloudinary from "../config/cloudinary.js";
// import User from "../models/User.js";
// import multer from "multer";
// import sharp from "sharp";   // ✅ Added for image compression
// import fs from "fs";

// // ✅ Function to remove spaces & special chars from filename
// function cleanFileName(originalName) {
//   return originalName
//     .replace(/\s+/g, "_")         // spaces → underscore
//     .replace(/[^a-zA-Z0-9._-]/g, "") // remove special chars
//     .toLowerCase();
// }

// // ✅ multer for file handling (temp upload)
// const storage = multer.diskStorage({
//   filename: function (req, file, cb) {
//     const cleanName = cleanFileName(file.originalname);
//     cb(null, `${Date.now()}-${cleanName}`); // timestamp + cleaned name
//   }
// });

// export const upload = multer({ storage });

// // 👉 Bank Proof Upload Controller
// export const uploadBankProof = async (req, res) => {
//   try {
//     const { userId } = req.body; // frontend se aayega userId
//     const user = await User.findById(userId);

//     if (user.bankDetails.bankProof) {
//       return res.status(400).json({
//         success: false,
//         message: "Bank proof already uploaded hai!",
//       });
//     }

//     // ✅ COMPRESS IMAGE BEFORE UPLOAD (max ~1MB)
//     const compressedPath = req.file.path + "-compressed.jpg";
//     await sharp(req.file.path)
//       .jpeg({ quality: 70 }) // compress quality
//       .toFile(compressedPath);

//     // ✅ Cloudinary upload (compressed image)
//     const result = await cloudinary.uploader.upload(compressedPath, {
//       folder: "bankProofs",
//     });

//     // ✅ remove temp files
//     fs.unlinkSync(req.file.path);
//     fs.unlinkSync(compressedPath);

//     user.bankDetails.bankProof = result.secure_url;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Bank proof successfully upload ho gaya!",
//       imageUrl: result.secure_url,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
