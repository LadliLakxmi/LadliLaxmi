// controllers/bankController.js

import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path"; // ✅ 1. Path module import karein
import { tmpdir } from "os"; // ✅ 2. OS ka temporary directory lene ke liye

// ✅ Function to remove spaces & special chars from filename
function cleanFileName(originalName) {
  return originalName
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

// ✅ Multer using memory, NOT saving to disk
// const storage = multer.memoryStorage();

// ✅ NEW CODE (Ise istemal karein)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpdir()); // OS ki temporary directory me save karega
  },
  filename: (req, file, cb) => {
    // Ek unique filename banayein
    const uniqueSuffix = `${req.body.userId || 'unknown'}-${Date.now()}`;
    cb(null, `${uniqueSuffix}-${cleanFileName(file.originalname)}`);
  }
});

// ✅ BEST PRACTICE: Ek file size limit bhi set karein (jaise 20MB)
export const upload = multer({
  storage: storage, // Naya diskStorage
  limits: { fileSize: 5 * 1024 * 1024 } // 20 MB limit
});

// 👉 Bank Proof Upload Controller
export const uploadBankProof = async (req, res) => {
  const compressedPath = path.join(tmpdir(), `temp-${req.body.userId}-${Date.now()}.jpg`);
  const originalPath = req.file?.path;
  try {

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was uploaded." });
    }
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // if (user.bankDetails.bankProof) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Bank proof already uploaded hai!",
    //   });
    // }

    // ✅ COMPRESS image (max ~1MB)
    
    // 1. ✅ CHECK: Agar already verified hai, toh re-upload block kar do
    if (user.bankProofVerified === "verified") {
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }
      return res.status(400).json({
        success: false,
        message: "Bank proof is already verified. Re-upload not allowed.",
      });
    }


    // 2. ✅ DELETE OLD PROOF: Agar purana proof (public_id) hai, toh use delete karo
    if (user.bankDetails.bankProof && user.bankDetails.bankProof.public_id) {
      try {
        await cloudinary.uploader.destroy(user.bankDetails.bankProof.public_id);
      } catch (cld_err) {
        console.error("Cloudinary delete error:", cld_err);
        // Is error ko ignore karein aur upload continue rakhein
      }
    }
    // 3. ✅ COMPRESS & SAVE

    await sharp(originalPath)
      .jpeg({ quality: 70 })
      .toFile(compressedPath);

    //4. ✅ Upload to cloudinary
    const result = await cloudinary.uploader.upload(compressedPath, {
      folder: "bankProofs",
    });

    // 5. ✅ SAVE: Naya URL aur public_id save karein
    user.bankDetails.bankProof = {
      url: result.secure_url,
      public_id: result.public_id
    };

    user.bankProofVerified = "pending"; // ← important: admin will verify later
    await user.save();

    res.status(200).json({
      success: true,
      message: "Bank proof successfully uploaded!",
      imageUrl: result.secure_url,
      status: user.bankProofVerified,
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: "File is too large! Limit is 5MB."});
    }
    res.status(500).json({ success: false, message: err.message });
  }finally {
    // 6. ✅ CLEANUP: Temporary file ko hamesha delete karein (success ya error)
    if (fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);// Compressed file delete karein
    }
    if (originalPath && fs.existsSync(originalPath)) { 
      fs.unlinkSync(originalPath); // Original uploaded file delete karein
    }
  }
};
// controllers/bankController.js

// import cloudinary from "../config/cloudinary.js";
// import User from "../models/User.js";
// import multer from "multer";
// import sharp from "sharp";
// import fs from "fs";

// // ✅ Function to remove spaces & special chars from filename
// function cleanFileName(originalName) {
//   return originalName
//     .replace(/\s+/g, "_")
//     .replace(/[^a-zA-Z0-9._-]/g, "")
//     .toLowerCase();
// }

// // ✅ Multer using memory, NOT saving to disk
// const storage = multer.memoryStorage();
// export const upload = multer({ storage });

// // 👉 Bank Proof Upload Controller
// export const uploadBankProof = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const user = await User.findById(userId);

//     if (user.bankDetails.bankProof) {
//       return res.status(400).json({
//         success: false,
//         message: "Bank proof already uploaded hai!",
//       });
//     }

//     // ✅ COMPRESS image (max ~1MB)
//     const compressedPath = `temp-${Date.now()}.jpg`;

//     await sharp(req.file.buffer)
//       .jpeg({ quality: 70 })
//       .toFile(compressedPath);

//     // ✅ Upload to cloudinary
//     const result = await cloudinary.uploader.upload(compressedPath, {
//       folder: "bankProofs",
//     });

//     // ✅ remove temporary file
//     fs.unlinkSync(compressedPath);

//     // user.bankDetails.bankProof = result.secure_url;
//     user.bankDetails.bankProof = result.secure_url;
//     user.bankProofVerified = "pending"; // ← important: admin will verify later
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Bank proof successfully upload ho gaya!",
//       imageUrl: result.secure_url,
//       status: user.bankProofVerified,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
