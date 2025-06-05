const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getSummary,
} = require("../controllers/transaction.controller");

const { isLoggedIn } = require("../middleware");

router
  .route("/")
  .get(isLoggedIn, getTransactions)
  .post(isLoggedIn, createTransaction);

router.delete("/:id", isLoggedIn, deleteTransaction);
router.get("/summary", isLoggedIn, getSummary);

module.exports = router;
