const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  login,
  register,
  verifyEmail,
  logout,
} = require("../controllers/auth.controller");

const { isLoggedIn } = require("../middleware");

router.post("/login", login);
router.post("/register", register);
router.post("/verify", isLoggedIn, verifyEmail);
router.post("/logout", isLoggedIn, logout);

module.exports = router;
