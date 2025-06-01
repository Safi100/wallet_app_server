const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getCategories,
  createCategory,
} = require("../controllers/category.controller");

const { isLoggedIn } = require("../middleware");

router
  .route("/")
  .get(isLoggedIn, getCategories)
  .post(isLoggedIn, createCategory);

module.exports = router;
