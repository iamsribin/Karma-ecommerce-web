const Product = require("../../models/adminModels/product");
const mongoose = require("mongoose");

// get single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Inalid ID!!!"));
    }

    const product = await Product.findOne({ _id: id }).populate("category", {
      name: 1,
    });

    res.render("user/pages/product", { product: product });
  } catch (error) {
    return next(createError(null, null));
  }
};
