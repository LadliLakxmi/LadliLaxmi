// routes/userRoutes.js
const {auth} = require("../middleware/auth")
const express = require("express");
const router = express.Router();
const {getDownlineStatus} = require("../controllers/DownlineStatus")

router.get("/downline-status", auth, getDownlineStatus);

module.exports = router;
