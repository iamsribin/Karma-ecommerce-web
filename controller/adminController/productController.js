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


    const variants = size.map((size, index) => ({
      size: new ObjectId(size),
      quantity: parseInt(quantity[index], 10) || 0,
    }));

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
      croppedImages
    } = req.body;

    const { id } = req.params;



    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
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


    let product = await productDB.findById(id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect(`/admin/edit-product/${id}`);
    }

    const files = req.files;
    let imagePaths = [...product.imagePaths];

    if (files && files.length > 0) {
      files.forEach((file, idx) => {
        const imgPath = `/uploads/products/${file.filename}`;
        if (imagePaths[idx]) {
          fs.unlink(path.join(__dirname, '..', imagePaths[idx]), (err) => {
            if (err) console.error(err);
          });
        }
        imagePaths[idx] = imgPath;
      });
    }

    if (croppedImages) {
      for (const [idx, croppedImage] of Object.entries(croppedImages)) {
        if (croppedImage) {
          const base64Data = croppedImage.replace(/^data:image\/\w+;base64,/, "");
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



    product = await productDB.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name: mainName,
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
          imagePaths,
          offerExpiryDate,
        },
      },
      { new: true }
    );

    req.flash("success", `Product ${upperName} updated successfully`);
    res.redirect(`/admin/edit-product/${id}`);
  } catch (error) {
    console.log("category", error);
    res.redirect("/internalError");
  }
};



exports.adminAddProductCheck_get = async (req, res) => {
	const productTitle = req.body.text;
  console.log("df",productTitle);
	let searchResult = await Product.find({ name: { $in: [productTitle] } });
	console.log(searchResult);
  if (searchResult.length === 0) {
		res.json({ status: true, message: 'Available' });
	} else {
		res.json({ status: false, message: 'Not Available' });
	}
};