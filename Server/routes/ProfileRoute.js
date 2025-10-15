const express = require("express");
const { auth } = require("../middleware/auth");
const { getProfile,updateBankDetails,updateProfile,getTeam,getTeamPaged } = require("../controllers/profile");
// const { protect } = require("../middleware/auth"); // You must have this middleware
const router = express.Router();

// router.get("/getprofile", protect,getProfile); // Ensure you have the correct method from your controller
router.get("/getprofile/:id",auth, getProfile); // ✅ Fixed route
router.put('/bank-details',auth, updateBankDetails);
router.put('/update-profile',auth, updateProfile);
router.get('/get-team/:id',auth, getTeam);
router.get('/get-team-paged/:id', auth, getTeamPaged);
module.exports = router;