const Product = require("../../models/adminModels/product");
const mongoose = require("mongoose");
const {createError} = require("../../utils/errors");
const productDB = require("../../models/adminModels/product")

// get single product
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Inalid ID!!!"));
    }

    const product = await Product.findOne({ _id: id }).populate("category", {
      name: 1,
    });

    res.render("user/pages/product", { product: product,title:"Single Product" });
  } catch (error) {
    return next(createError(null, null));
  }
};

//categories page
exports.renderCategoryPage = async (req, res) => {
  let products = await productDB.find({});
  return res.render("user/pages/category",{products,title:"Category"});
};