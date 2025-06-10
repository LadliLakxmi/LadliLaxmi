const {auth} = require("../middleware/auth")
const express = require("express");
const router = express.Router();
const {capturePayment , verifyPayment,transferFundsToDownline} = require("../controllers/donation")

// router.post('/create-order',capturePayment);
// router.post('/verify-payment',verifyPayment);
// ✅ Add auth middleware here
router.post('/create-order', auth, capturePayment);
router.post('/verify-payment', auth, verifyPayment);
router.post('/transfer-to-downline', auth, transferFundsToDownline);


module.exports = router;
