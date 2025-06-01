const Category = require("../models/category.model");
const HandleError = require("../utils/HandleError");

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
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
