const mongoose = require("mongoose");
const { createError } = require("../../utils/errors");
const productDB = require("../../models/adminModels/product");
const userDB = require("../../models/userModels/userModel")

// get single product
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.render( "errorPages/404");``
    }

    // Fetch the single product along with its brand and category
    const product = await productDB
      .findOne({ _id: id })
      .populate("brand")
      .populate("category")
      .populate("tag")
      .populate({
        path: "variants.size",
        model: "Size",
      });

    if (!product) {
      return next(createError(404, "Product not found"));
    }

    // Fetch related products by the same category, excluding the current product
    const relatedProducts = await productDB
      .find({
        category: product.category._id,
        _id: { $ne: product._id },
        isActive: true,
      })
      .populate("brand")
      .populate("category")
      .populate("tag")
      .limit(5);

    const userDetalis = await userDB.findOne({ email: req.session.userGmail });
    
    res.render("user/pages/product", {
      user: userDetalis,
      product: product,
      relatedProducts: relatedProducts,
      title: "Single Product",
    });

  } catch (error) {
    console.log(error);
    return next(createError(500, error.message));
  }
};


//categories page
exports.renderCategoryPage = async (req, res) => {
  const products = await productDB
    .find({})
    .populate("brand")
    .populate("category");
const userDetalis = await userDB.findOne({email: req.session.userGmail});
  return res.render("user/pages/category", {      user: userDetalis, products, title: "Category" });
};
