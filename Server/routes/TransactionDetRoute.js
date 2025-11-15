const express = require("express");
const { auth } = require("../middleware/auth");
const router = express.Router();
const {
  transactiondetails,
  getAllTransactions,
  updateTransactionStatus,
   getUserTransactions,
   checkUtrExists
} = require("../controllers/transactiondata");

router.post("/transaction", transactiondetails);
router.get("/transactions", getAllTransactions);
router.put("/transaction/:id/status", updateTransactionStatus);
router.get("/my-transactions",auth, getUserTransactions);

// ✅ NAYA ROUTE YAHAN ADD KAREIN
router.get("/transaction/check-utr/:utr", checkUtrExists); // Hum :utr parameter ka use karenge
module.exports = router;
