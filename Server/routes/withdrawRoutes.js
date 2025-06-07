const express = require('express')
const { auth,isAdmin } = require("../middleware/auth");
const { WithdrawRequest,updateWithdrawStatus,getWithdrawSummary } = require("../controllers/Withdraw");

const router = express.Router();


router.post("/request",auth, WithdrawRequest); // ✅ Fixed route
router.get("/summary",auth, getWithdrawSummary);
router.patch("/update/:id", auth, isAdmin, updateWithdrawStatus); // Admin route
// router.post("/request/:id", WithdrawRequest); // ✅ Fixed route

module.exports = router;