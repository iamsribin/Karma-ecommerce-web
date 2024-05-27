const categoryDB = require("../../models/adminModels/category");
const { createError } = require("../../utils/errors");
const brandDB = require("../../models/adminModels/brand");
const mongoose = require("mongoose");

//render categories and brand page
exports.renderCategoriesAndBrands = async (req, res, next) => {
  try {
    const categories = await categoryDB.find({});
    const brands = await brandDB.find({});
    return res.render("admin/adminDasbord/categoriesAndBrands", {
      categories,
      brands,
    });
  } catch (error) {
    console.log(error);
  }
};

//render add category page
exports.renderAddCategoryPage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addCategory");
};

//add new category
exports.AddNewCategory = async (req, res, next) => {
  try {
    const { name, discription } = req.body;

    const existingCategory = await categoryDB.findOne({
      name,
      isActive: true,
    });

    if (existingCategory) {
      return next(
        createError(400, "This category already exists and is active!")
      );
    }

    const newCategory = new categoryDB({ name, discription });

    newCategory.save();

    return res.status(200).send(newCategory);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid ID"));
    }

    const category = await categoryDB.findById(id);
    if (!category) {
      return next(createError(404, "category not found"));
    }
    category.isActive = false;
    await category.save();

    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

// #########################    BRAND   #######################

exports.renderAddBrandPage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addBrand");
};

exports.AddNewBrand = async (req, res, next) => {
  try {
    const { name, discription } = req.body;

    const existingBrand = await brandDB.findOne({
      name,
      isActive: true,
    });

    if (existingBrand) {
      return next(createError(400, "This brand already exists and is active!"));
    }

    const newBrand = new brandDB({ name, discription });

    newBrand.save();

    return res.status(200).send(newBrand);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//delete brand
exports.deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid ID"));
    }

    const brand = await brandDB.findById(id);
    if (!brand) {
      return next(createError(404, "brand not found"));
    }
    brand.isActive = false;
    await brand.save();

    res.status(200).send(brand);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};
