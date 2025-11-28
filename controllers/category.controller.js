const Category = require("../models/category.model");
const Transaction = require("../models/transaction.model");
const HandleError = require("../utils/HandleError");
const mongoose = require("mongoose");

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

module.exports.getCategoriesWithTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "transactions",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    { $eq: ["$user_id", new mongoose.Types.ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $addFields: {
          transactionCount: { $size: "$transactions" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          icon: 1,
          transactionCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { transactionCount: -1 },
      },
    ]);

    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

module.exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name || !icon) {
      throw new HandleError("Please fill all the fields", 400);
    }
    const category = new Category({
      name,
      icon,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};
