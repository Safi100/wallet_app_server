const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");

const { isLoggedIn } = require("../middleware");

router
  .route("/")
  .get(isLoggedIn, getTransactions)
  .post(isLoggedIn, createTransaction);

router.route("/:id").delete(isLoggedIn, deleteTransaction);

module.exports = router;
