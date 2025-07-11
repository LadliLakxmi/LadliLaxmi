const {auth } = require("../middleware/auth")
const express = require("express");
const {register , logout ,verifyOtp,login,changePassword } = require("../controllers/Registration")
const {contactUsController} = require("../controllers/ContactUs.js")
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/verify-otp',verifyOtp);
router.post('/changepassword',auth,changePassword);
 //import controller

//mapping 
router.post("/mail", contactUsController)


module.exports = router;
