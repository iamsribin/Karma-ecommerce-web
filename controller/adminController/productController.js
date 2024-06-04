const mongoose = require("mongoose");
const Product = require("../../models/adminModels/product");
const productDB = require("../../models/adminModels/product");
const { createError } = require("../../utils/errors");
const brandDB = require("../../models/adminModels/brand");
const categoriesDB = require("../../models/adminModels/category");
const sizeDB = require("../../models/adminModels/size");
const tagDB = require("../../models/adminModels/tag");
const fs = require("fs");
const { ObjectId } = require("mongodb");

// render products list page
exports.renderProducts = async (req, res, next) => {
  try {
    const products = await productDB
      .find({})
      .populate("brand")
      .populate("category");
    return res.render("admin/adminDasbord/products", { products });

  } catch (error) {
    return res.redirect("/internalError");  }
};

// render add products page
exports.renderAddproduct = async (req, res) => {
  try {

    const brands = await brandDB.find({});
    const categories = await categoriesDB.find({});
    const sizes = await sizeDB.find({ isActive: true });
    const tags = await tagDB.find({ isActive: true });

    return res.render("admin/adminDasbord/addproduct", {
      brands,
      categories,
      tags,
      sizes,
    });

  } catch (error) {
    return res.redirect("/internalError");  }
};

//add products
exports.addProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      basePrice,
      size,
      brand,
      category,
      quantity,
      midsoleDrop,
      heel,
      tag,
      foreFoot,
      weight,
      offerAmount,
      offerExpiryDate,
    } = req.body;

    if (req.files.length < 1) {
      req.flash('error', 'Product not found');
      return res.redirect("/admin/add-product");
    }
    const mainName = name.toUpperCase();

    const variants = size.map((size, index) => ({
      size: new ObjectId(size),
      quantity: parseInt(quantity[index], 10) || 0,
    }));
    
    let Quantity = quantity.map(Number);


    let totalQuantity = Quantity.reduce((accumulator, current) => {
      return accumulator += current;
    }, 0);

    const files = req.files;

    const imagePaths = Object.values(files)
      .flat()
      .map((file) => `uploads/products/${file.filename}`);

    let product;

    const existProduct = await Product.findOne({
      name: mainName,
      isActive: true,});
      
    if(existProduct){
      req.flash('error', 'Product already exist');
      return res.redirect("/admin/add-product");
    }

    if (offerAmount) {
      product = new Product({
        name: mainName,
        description,
        basePrice,
        brand,
        category,
        variants,
        totalQuantity,
        quantity,
        imagePaths,
        tag,
        midsoleDrop,
        heel,
        foreFoot,
        weight,
        offerAmount,
        offerExpiryDate,
      });
    } else {
      product = new Product({
        name: mainName,
        description,
        basePrice,
        variants,
        brand,
        tag,
        category,
        quantity,
        totalQuantity,
        imagePaths,
        midsoleDrop,
        heel,
        foreFoot,
        weight,
      });
    }

    await product.save();

    req.flash('success', `Product ${mainName} added successfully`);
    return res.redirect("/admin/add-product");
  } catch (error) {

    console.log(error);
    return res.redirect("/internalError");
  }
};

//delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError(400, "Inalid ID!!!"));
    }

    const product = await productDB.findById(id);
    product.isActive = false;

    product.imagePaths.forEach((imagePath) => {
      fs.unlinkSync(imagePath);
    });

    product.save();

    return res.status(200).json({ product });
  } catch (error) {
    return res.redirect("/internalError");  }
};

//render edit product page
exports.renderEditProductPage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).render("errorPages/404");
    }
    const product = await productDB
      .findById(id)
      .populate("brand")
      .populate("category");

    const categories = await categoriesDB.find({
      name: { $ne: product.category.name },
    });
    const brands = await brandDB.find({ name: { $ne: product.brand.name } });
    const sizes = await sizeDB.find({ isActive: true });
    const tags = await tagDB.find({ isActive: true });


    return res.render("admin/adminDasbord/editProduct", {
      product,
      categories,
      brands,
      tags,
      sizes
    });

  } catch (error) {
    console.log(error);
    return res.redirect("/internalError");
  }
};

//edit product
exports.editProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      basePrice,
      brand,
      category,
      quantity,
      qualityChecking,
      width,
      height,
      weight,
      offerAmount,
      offerExpiryDate,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).render("errorPages/404");
    }
    // const product = await productDB.findOneAndUpdate(
    //   { _id: id },
    //   { $set: { name, discription } },
    //   { new: true }
    // );

    const files = req.files;

    const imagePaths = Object.values(files)
      .flat()
      .map((file) => `uploads/products/${file.filename}`);

    let product;

    product = await productDB.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          description,
          basePrice,
          brand,
          category,
          quantity,
          imagePaths,
          qualityChecking,
          width,
          height,
          weight,
          offerAmount,
          offerExpiryDate,
        },
      },
      { new: true }
    );

    if (!product) {
      return next(createError(404, "category not found"));
    }
    console.log(product);

    res.status(200).send({ product });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};
