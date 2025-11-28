const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getCategories,
  createCategory,
  getCategoriesWithTransactions,
} = require("../controllers/category.controller");

const { isLoggedIn } = require("../middleware");

router
  .route("/")
  .get(isLoggedIn, getCategories)
  .post(isLoggedIn, createCategory);

router.get("/with-transactions", isLoggedIn, getCategoriesWithTransactions);

module.exports = router;
