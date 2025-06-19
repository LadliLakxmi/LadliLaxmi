// In your routes file (e.g., userRoutes.js)
const express = require('express');
const router = express.Router();
const {getUplineBeneficiaries} = require('../controllers/Upline'); // Adjust path
const { auth } = require("../middleware/auth");

// Route still looks like this, but the backend function no longer uses `targetLevel` query param
router.get('/users/:id/upline-beneficiaries', auth,getUplineBeneficiaries);

module.exports = router;