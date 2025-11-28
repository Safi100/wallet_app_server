const mongoose = require("mongoose");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const HandleError = require("../utils/HandleError");

module.exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .populate({ path: "category", select: ["name", "icon"] })
      .sort({ createdAt: -1 });

    const grouped = transactions.reduce((acc, tx) => {
      const date = tx.createdAt.toISOString().split("T")[0];
      let group = acc.find((g) => g.date === date);
      if (!group) {
        group = { date, transactions: [] };
        acc.push(group);
      }
      group.transactions.push(tx);
      return acc;
    }, []);

    res.status(200).json(grouped);
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
    if (type != "expenses" && type != "income") {
      throw new HandleError("Type must be income or expenses", 400);
    }
    if (amount < 1) {
      throw new HandleError("Amount must be greater than 0", 400);
    }

    const transaction = new Transaction({
      user_id: req.user.id,
      title,
      amount: type === "expenses" ? -Math.abs(amount) : Math.abs(amount),
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

module.exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [result] = await Transaction.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expenses"] }, "$amount", 0],
            },
          },
          balance: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const income = result?.income || 0;
    const expenses = result?.expenses || 0;
    const balance = result?.balance || 0;

    res.status(200).json({ balance, income, expenses });
  } catch (err) {
    next(err);
  }
};

module.exports.getTransactionsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await Category.findById(id);
    if (!category) {
      throw new HandleError("Category not found", 404);
    }

    const transactions = await Transaction.find({
      user_id: userId,
      category: category._id,
    })
      .populate({ path: "category", select: ["name", "icon"] })
      .sort({ createdAt: -1 });

    // Group transactions by date
    const grouped = transactions.reduce((acc, tx) => {
      const date = tx.createdAt.toISOString().split("T")[0];
      let group = acc.find((g) => g.date === date);
      if (!group) {
        group = { date, transactions: [] };
        acc.push(group);
      }
      group.transactions.push(tx);
      return acc;
    }, []);

    // Calculate summary
    const summary = transactions.reduce(
      (acc, tx) => {
        acc.total += tx.amount;
        acc.count += 1;
        return acc;
      },
      { total: 0, count: 0 }
    );

    res.status(200).json({ transactions: grouped, summary });
  } catch (err) {
    next(err);
  }
};
