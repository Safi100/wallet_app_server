const express = require("express");
const env = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const app = express();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "⚠️ You have exceeded the 100 requests in 15 minutes limit!",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(apiLimiter);

// Routes
const authRoutes = require("./routes/auth.route");
const categoryRoutes = require("./routes/category.route");
const transactionRoutes = require("./routes/transaction.route");

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/transaction", transactionRoutes);

app.use((err, req, res, next) => {
  if (!err.message) err.message = "Internal Server Error";
  const { statusCode = 500 } = err;
  console.log(err.message);
  res.status(statusCode).json(err.message);
});

const axios = require("axios");
const cron = require("node-cron");

cron.schedule("*/5 * * * *", async () => {
  await axios
    .get("https://wallet-app-server-mydy.onrender.com/")
    .then((response) => {
      console.log("Data fetched from external API");
    })
    .catch((error) => {
      console.error("Error fetching data from external API");
    });
});

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
