const User = require("../models/user.model");
const VerifyCode = require("../models/verifyCode.model");
const jwt = require("jsonwebtoken");
const HandleError = require("../utils/HandleError");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/SendEmail");
const axios = require("axios");

async function generateRandomVerifyCodeWithEmail(user, req) {
  const existingCode = await VerifyCode.findOne({ userId: user._id });
  if (existingCode) return;

  const code = Math.floor(100000 + Math.random() * 900000);
  const hashedCode = await bcrypt.hash(code.toString(), 10);

  const newVerifyCode = new VerifyCode({
    userId: user._id,
    code: hashedCode,
  });
  await newVerifyCode.save();

  // Get public internet ip from local ip
  const rawIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const clientIP = rawIP.replace("::ffff:", "");
  let publicIP = clientIP;
  try {
    const res = await axios.get("https://api.ipify.org?format=json");
    publicIP = res.data.ip || clientIP;
  } catch (err) {
    console.error("⚠️ Failed to fetch public IP:", err.message);
  }

  // Get ip location
  let location = "Unknown location";
  try {
    const res = await axios.get(`https://ipinfo.io/${publicIP}/json`);
    const { city, country } = res.data;
    location = `${city || "Unknown City"}, ${country || "Unknown Country"}`;
  } catch (err) {
    console.error("⚠️ Failed to fetch location:", err.message);
  }

  // send email
  await sendEmail(
    user.email,
    "Verify your email",
    code,
    publicIP,
    location,
    (time = new Date()
      .toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ""))
  );
}

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
    if (!user.isVerified) {
      await generateRandomVerifyCodeWithEmail(user, req);
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

    await generateRandomVerifyCodeWithEmail(user, req);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new HandleError("Please enter the code", 400);
    }

    if (code.length !== 6) {
      throw new HandleError("Code must be 6 digits", 400);
    }
    console.log(req.user);

    const verifyCode = await VerifyCode.findOne({ userId: req.user.id });

    if (!verifyCode) {
      throw new HandleError("No verification code found for this user", 400);
    }

    const isMatch = await bcrypt.compare(code, verifyCode.code);
    if (!isMatch) {
      throw new HandleError("Invalid code", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new HandleError("User not found", 404);
    }

    user.isVerified = true;
    await user.save();
    await VerifyCode.deleteOne({ _id: verifyCode._id });

    res.status(200).json({ message: "Email verified" });
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
