const mongoose = require("mongoose");
const Product = require("../../models/adminModels/product");
const productDB = require("../../models/adminModels/product");
const { createError } = require("../../utils/errors");
const brandDB = require("../../models/adminModels/brand");
const categoriesDB = require("../../models/adminModels/category");
const fs = require("fs");

// render products list page
exports.renderProducts = async (req, res, next) => {

  try {
    const products = await productDB.find({}).populate('brand').populate('category');
    return res.render("admin/adminDasbord/products", { products });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

// render add products page
exports.renderAddproduct = async (req, res, ) => {
  try {
    const brands = await brandDB.find({});
    const categories = await categoriesDB.find({});
   return res.render("admin/adminDasbord/addproduct",{brands, categories});
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }

};

//add products
exports.addproduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      basePrice,
      offerPrice,
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

    const files = req.files;

    const imagePaths = Object.values(files)
      .flat()
      .map((file) => `uploads/products/${file.filename}`);

    let product;

    if (offerAmount) {

      product = new Product({
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
      });

    } else {
      product = new Product({
        name,
        description,
        basePrice,
        offerPrice,
        brand,
        category,
        quantity,
        imagePaths,
        qualityChecking,
        width,
        height,
        weight,
      });
    }

    await product.save();

    res.status(200).json({ product: product });
  } catch (error) {

    return next(createError(null, null));
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
    
    product.imagePaths.forEach((imagePath)=> {
        fs.unlinkSync(imagePath);
    })
  
    product.save();

    return res.status(200).json({product});
  } catch (error) {

    return next(createError(500, error.message));
  }
};
