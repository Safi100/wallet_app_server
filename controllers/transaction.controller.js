const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const HandleError = require("../utils/HandleError");

module.exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .populate("category")
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
};

module.exports.createTransaction = async (req, res, next) => {
  try {
    const { title, amount, category, type } = req.body;
    const user = await User.findById(req.user.id);
    if (!category || !title || !amount || !type) {
      throw new HandleError("Please fill all the fields", 400);
    }
    if (!user) {
      throw new HandleError("User not found", 404);
    }
    const categoryExists = await Category.findOne({
      _id: category,
    });
    if (!categoryExists) {
      throw new HandleError("Category not found", 404);
    }
    if (type != "expense" && type != "income") {
      throw new HandleError("Type must be income or expense", 400);
    }
    if (amount < 1) {
      throw new HandleError("Amount must be greater than 0", 400);
    }

    const transaction = new Transaction({
      user_id: req.user.id,
      title,
      amount: Number(amount),
      category,
      type,
    });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      throw new HandleError("Transaction not found", 404);
    }
    console.log(transaction);

    if (transaction.user_id.toString() !== req.user.id) {
      throw new HandleError(
        "You are not authorized to delete this transaction",
        401
      );
    }
    await transaction.deleteOne();
    res
      .status(200)
      .json({ message: "Transaction deleted successfully", transaction });
  } catch (err) {
    next(err);
  }
};
