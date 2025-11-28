const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransactionsByCategory,
} = require("../controllers/transaction.controller");

const { isLoggedIn } = require("../middleware");

router
  .route("/")
  .get(isLoggedIn, getTransactions)
  .post(isLoggedIn, createTransaction);

router.delete("/:id", isLoggedIn, deleteTransaction);
router.get("/summary", isLoggedIn, getSummary);
router.get("/category/:id", isLoggedIn, getTransactionsByCategory);

module.exports = router;
