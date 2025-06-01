const express = require("express");
const env = require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

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
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

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

app.listen(8000, () => {
  console.log("Server started on port 8000");
});
