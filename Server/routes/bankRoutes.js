const express = require("express");
const { upload, uploadBankProof } = require("../controllers/bankController.js");

const router = express.Router();

// 👉 Ek hi baar bank proof upload karne ka route
router.post("/upload-bank-proof", upload.single("file"), uploadBankProof);

module.exports = router;
