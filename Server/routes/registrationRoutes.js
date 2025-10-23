const {auth } = require("../middleware/auth")
const express = require("express");
const {register , logout ,verifyOtp,login,changePassword,Referraluser } = require("../controllers/Registration")
const { forgotPassword, resetPassword } = require('../controllers/resetPassword');
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/verify-otp',verifyOtp);
router.post('/changepassword',auth,changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/referral/:code", Referraluser);

module.exports = router;
