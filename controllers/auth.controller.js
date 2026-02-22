const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const HandleError = require("../utils/HandleError");
const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports.login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password.trim();
    if (!email || !password) {
      throw new HandleError("Please fill all the fields", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HandleError("Please enter a valid email address", 400);
    }
    if (password.length < 6) {
      throw new HandleError("Password must be at least 6 characters", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new HandleError("User not found", 404);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HandleError("Invalid credentials", 400);
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("access_token", token, { httpOnly: true });
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password.trim();

    if (!email || !password) {
      throw new HandleError("Please fill all the fields", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HandleError("Please enter a valid email address", 400);
    }

    if (password.length < 6) {
      throw new HandleError("Password must be at least 6 characters", 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new HandleError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("access_token", token, { httpOnly: true });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
