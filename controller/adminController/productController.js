const mongoose = require("mongoose");
const productDB = require("../../models/adminModels/product");
const { createError } = require("../../utils/errors");
const fs = require("fs");


//delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError(400, "Inalid ID!!!"));
    }

    const product = await productDB.findById(id);
    product.status = false;
    
    product.imagePaths.forEach((imagePath)=> {
        fs.unlinkSync(imagePath);
    })
  
    product.save();

    return res.status(200).json({product});
  } catch (error) {

    return next(createError(500, error.message));
  }
};
