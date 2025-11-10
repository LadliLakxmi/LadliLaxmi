const express = require('express')
const { auth,isAdmin } = require("../middleware/auth");
const { WithdrawRequest,updateWithdrawStatus,getWithdrawSummary,getMyWithdrawRequests,saveBankDetails } = require("../controllers/Withdraw");

const router = express.Router();


router.post("/request",auth, WithdrawRequest); // ✅ Fixed route
router.get("/summary",auth, getWithdrawSummary);
router.patch("/update/:id", auth, isAdmin, updateWithdrawStatus); // Admin route
router.get('/my-requests', auth, getMyWithdrawRequests);
router.post("/save-bank-details", auth, saveBankDetails);

// router.post("/request/:id", WithdrawRequest); // ✅ Fixed route

module.exports = router;
