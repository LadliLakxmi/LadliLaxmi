const {auth } = require("../middleware/auth")
const express = require("express");
const {register , logout ,login } = require("../controllers/Registration")
const {contactUsController} = require("../controllers/ContactUs.js")
const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
 //import controller

//mapping 
router.post("/mail", contactUsController)


module.exports = router;