const mongoose = require("mongoose");
const Product = require("../../models/adminModels/product");
const productDB = require("../../models/adminModels/product");
const { createError } = require("../../utils/errors");
const brandDB = require("../../models/adminModels/brand");
const categoriesDB = require("../../models/adminModels/category");
const sizeDB = require("../../models/adminModels/size");
const tagDB = require("../../models/adminModels/tag");
const fs = require("fs");
const path = require('path');
const { ObjectId } = require("mongodb");
const size = require("../../models/adminModels/size");
const tag = require("../../models/adminModels/tag");

// render products list page
exports.renderProducts = async (req, res, next) => {
  try {
    const products = await productDB
      .find({})
      .populate("brand")
      .populate("category");
    console.log(products);
    return res.render("admin/adminDasbord/products", { products });
  } catch (error) {
    return res.redirect("/internalError");
  }
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
    return res.redirect("/internalError");
  }
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

    if(req.files.length > 5){
      req.flash("error", "maximum image limit exceeded");
      return res.redirect("/admin/add-product");
    }
    const mainName = name.toUpperCase();

    const existProduct = await Product.findOne({
      name: mainName,
      isActive: true,
    });

    if (existProduct) {
      req.flash("error", "Product already exist");
      return res.redirect("/admin/add-product");
    }

    if (req.files.length < 1) {
      req.flash("error", "Product not found");
      return res.redirect("/admin/add-product");
    }


    const variants = size.map((sizeValue, index) => {
      const quantityValue = parseInt(quantity[index], 10) || 0;
      let status;
    
      if (quantityValue > 5) {
        status = "published";
      } else if (quantityValue < 5 && quantityValue > 0) {
        status = "low quantity";
      } else if(quantityValue === 0){
        status = "out of stock";
      }
    
      return {
        size: new ObjectId(sizeValue),
        quantity: quantityValue,
        status,
      };
    });

    let Quantity = quantity.map(Number);

    let totalQuantity = Quantity.reduce((accumulator, current) => {
      return (accumulator += current);
    }, 0);

    const files = req.files;

    const imagePaths = Object.values(files)
      .flat()
      .map((file) => `/uploads/products/${file.filename}`);

    let product;

    

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

    req.flash("success", `Product ${mainName} added successfully`);
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
      return res.status(404).render("errorPages/404");
    }

    const product = await productDB.findById(id);
    product.isActive = false;

    // product.imagePaths.forEach((imagePath) => {
    //   fs.unlinkSync(imagePath);
    // });

    product.save();

    return res.status(200).json({ product });
  } catch (error) {
    console.log(error);
    return res.redirect("/internalError");
  }
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
      .populate("category")
      .populate("tag")
      .populate("variants.size");

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
      sizes,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/internalError");
  }
};

//edit product
exports.editProduct = async (req, res, next) => {
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
      croppedImages,
    } = req.body;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render('errorPages/404');
    }

    const mainName = name.toUpperCase();

    const existProduct = await Product.findOne({
      name: mainName,
      isActive: true,
      _id: { $ne: id },
    });

    if (existProduct) {
      req.flash('error', 'Product already exists');
      return res.redirect(`/admin/edit-product/${id}`);
    }

    
    if(req.files.length > 5){
      req.flash("error", "maximum image limit exceeded");
      return res.redirect(`/admin/edit-product/${id}`);
    }

    let product = await Product.findById(id);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect(`/admin/edit-product/${id}`);
    }

    const files = req.files;
    let imagePaths = [...product.imagePaths];

    // Handle uploaded images
    if (files && files.length > 0) {
      files.forEach((file) => {
        const imgPath = `/uploads/products/${file.filename}`;
        imagePaths.push(imgPath); // Append new images to the array
      });
    }

    // Handle cropped images
    if (croppedImages) {
      for (const [idx, croppedImage] of Object.entries(croppedImages)) {
        if (croppedImage) {
          const base64Data = croppedImage.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `${Date.now()}-${idx}.png`;
          const imgPath = `/uploads/products/${fileName}`;
          fs.writeFileSync(`./uploads/products/${fileName}`, buffer);
          if (imagePaths[idx]) {
            fs.unlink(path.join(__dirname, '..', imagePaths[idx]), (err) => {
              if (err) console.error(err);
            });
          }
          imagePaths[idx] = imgPath;
        }
      }
    }

    // Prepare variants
    const variants = size.map((sizeValue, index) => {
      const quantityValue = parseInt(quantity[index], 10) || 0;
      let status;

      if (quantityValue > 5) {
        status = 'published';
      } else if (quantityValue > 0) {
        status = 'low quantity';
      } else {
        status = 'out of stock';
      }

      return {
        size: new mongoose.Types.ObjectId(sizeValue),
        quantity: quantityValue,
        status,
      };
    });

    const totalQuantity = quantity.map(Number).reduce((acc, curr) => acc + curr, 0);

    // Update product
    product = await Product.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name: mainName,
          description,
          basePrice,
          brand,
          category,
          totalQuantity,
          variants,
          midsoleDrop,
          heel,
          tag,
          foreFoot,
          weight,
          offerAmount,
          offerExpiryDate,
          imagePaths,
        },
      },
      { new: true }
    );

    req.flash('success', `Product ${mainName} updated successfully`);
    res.redirect(`/admin/edit-product/${id}`);
  } catch (error) {
    console.log('category', error);
    res.redirect('/internalError');
  }
};


exports.adminAddProductCheck_get = async (req, res) => {
	const {text, id} = req.body;
  let searchResult
  if(id){
    searchResult = await Product.find({ name: { $in: [text] }, _id: { $ne: id}});
  }else{
    searchResult = await Product.find({ name: { $in: [text] } });
  }

  if (text.trim() === '') {
    res.json({ status: false, message: 'Not Available' });

	} else if (searchResult.length === 0 ){
		res.json({ status: true, message: 'Available' });

	}else{
    res.json({ status: false, message: 'Not Available' });
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { index, id } = req.body;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imagePath = product.imagePaths[index];

    if (!imagePath) {
      return res.status(400).json({ message: "Image not found at the specified index" });
    }

    // Remove the image path from the array
    product.imagePaths.splice(index, 1);
    await product.save();

    // Delete the image file from the folder
    const imagePathToDelete = path.join(__dirname,".."+imagePath);
    fs.unlink(imagePathToDelete, (err) => {
      if (err) {
        console.log("Failed to delete image file:", err);
      } else {
        console.log("Image file deleted successfully");
      }
    });

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

