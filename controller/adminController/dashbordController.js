const Product = require("../../models/adminModels/product");
const { createError } = require("../../utils/errors");
const productDB = require("../../models/adminModels/product");



//render dashboard page
exports.renderDashboard = async (req, res) => {
  res.render("admin/adminDasbord/dashbord");
};

// render products page
exports.renderProducts = async (req, res, next) => {
  try {
    const products = await productDB.find({});
    return res.render("admin/adminDasbord/products", { products: products });
  } catch (error) {
    return next(createError(null, null));
  }
};

// render add products page
exports.renderAddproduct = async (req, res) => {
  res.render("admin/adminDasbord/addproduct");
};


// render category page
exports.renderCategory = async (req, res) => {
  res.render("admin/adminDasbord/addproduct");
};

// render order page
exports.renderOrder = async (req, res) => {
  res.render("admin/adminDasbord/orders");
};

// render banner page
exports.renderBanner = async (req, res) => {
  res.render("admin/adminDasbord/addproduct");
};

// render payments page
exports.renderPayments = async (req, res) => {
  res.render("admin/adminDasbord/payments");
};


//add product
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
