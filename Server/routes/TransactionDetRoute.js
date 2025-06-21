const express = require("express");
const { auth } = require("../middleware/auth");
const router = express.Router();
const {
  transactiondetails,
  getAllTransactions,
  updateTransactionStatus,
} = require("../controllers/transactiondata");

router.post("/transaction", transactiondetails);
router.get("/transactions", getAllTransactions);
router.put("/transaction/:id/status", updateTransactionStatus);

module.exports = router;
