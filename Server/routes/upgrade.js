const express = require("express");
const { auth } = require("../middleware/auth");
const {initiateUpgrade}=require("../controllers/Upgrade")

const router = express.Router();

// User routes
router.post("/",auth, initiateUpgrade);

module.exports = router;
