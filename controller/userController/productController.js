const mongoose = require("mongoose");
const { createError } = require("../../utils/errors");
const productDB = require("../../models/adminModels/product");
const userDB = require("../../models/userModels/userModel");
const cartDB = require("../../models/userModels/cartModel");
const Category = require("../../models/adminModels/category");
const Size = require("../../models/adminModels/size");
const Tag = require("../../models/adminModels/tag");
const Brand = require("../../models/adminModels/brand");
const Review = require("../../models/userModels/reviewModel");
const { logCheck } = require("../adminController/adminAuthController");

// get single product
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.render("errorPages/404");
    }
    const cart = await cartDB.findOne({ userId: req.session.userId });
    cartLength = cart?.cart?.length;
    // Fetch the single product along with its brand and category
    const product = await productDB
      .findOne({ _id: id, isActive: true })
      .populate("brand")
      .populate("category")
      .populate("tag")
      .populate({
        path: "variants.size",
        model: "Size",
      });

    if (!product) {
      return res.render("errorPages/404");
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

    const reviews = await Review.find({ product: id })
      .populate("userId", "name profilePicture")
      .select("rating Description createdAt userId")
      .exec();

    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

    const userDetalis = await userDB.findOne({ email: req.session.userGmail });

    const brands = await Brand.find({}).limit(5).exec();
    const categories = await Category.find({}).limit(5).exec();
    const tags = await Tag.find({}).limit(5).exec();

    res.render("user/pages/product", {
      user: userDetalis,
      product: product,
      cartLength,
      relatedProducts: relatedProducts,
      averageRating,
      totalReviews,
      reviews,
      brands,
      categories,
      tags,
      title: "Single Product",
    });
  } catch (error) {
    console.log(error);
    return next(createError(500, error.message));
  }
};

//categories page
exports.renderCategoryPage = async (req, res) => {
  const {
    tag,
    category,
    brand,
    size,
    minPrice,
    maxPrice,
    search,
    sort,
    page = 1,
    limit = 9,
  } = req.query;

  const searchInput = req.query.search;
try {
  if (
    !tag &&
    !category &&
    !brand &&
    !size &&
    !minPrice &&
    !maxPrice &&
    !search &&
    !sort
  ) {
    const skip = (page - 1) * limit;
    const products = await productDB
      .find({ isActive: true })
      .populate("brand")
      .populate("category")
      .populate("tag")
      .skip(skip)
      .limit(parseInt(limit));

    const userDetalis = await userDB.findOne({ email: req.session.userGmail });
    const categorys = await Category.find({ isActive: true });
    const sizes = await Size.find({ isActive: true });
    const brands = await Brand.find({ isActive: true });
    const tags = await Tag.find({ isActive: true });

    const totalAvailableProducts = await productDB.countDocuments({ isActive: true });

    let cartLength = 0;
    const cart = await cartDB.findOne({ userId: req.session.userId });
    cartLength = cart?.cart?.length;

    return res.render("user/pages/category", {
      cartLength,
      user: userDetalis,
      products,
      title: "Category",
      categorys,
      sizes,
      brands,
      totalPages: Math.ceil(totalAvailableProducts / limit),
      currentPage: parseInt(page),
      tags,
    });
  }

  let filter = {
    "variants.status": { $in: ["published", "low quantity"] },
    isActive: true,
  };


  // Gender filter
  if (tag) {
    filter.tag = { $in: tag.split(",") };
  }

  // Category filter
  if (category) {
    filter.category = { $in: category.split(",") };
  }

  // Brand filter
  if (brand) {
    filter.brand = { $in: brand.split(",") };
  }

  // Size filter
  if (size) {
    filter["variants.size"] = { $in: size.split(",") };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.offerAmount = {};
    if (minPrice) filter.offerAmount.$gte = parseFloat(minPrice);
    if (maxPrice) filter.offerAmount.$lte = parseFloat(maxPrice);
  }

  // Search filter
  if (search) {
    filter.name = { $regex: new RegExp(search, "i") };
  }
    // Sorting
    let sortOptions = {};
    if (sort == "LowtoHigh") {
      sortOptions.offerAmount = 1;
    } else if (sort == "HightoLow") {
      sortOptions.offerAmount = -1;
    } else if (sort == "Newest") {
      sortOptions.createdAt = -1;
    } else if (sort == "aToz") {
      sortOptions.name = 1;
    } else if (sort == "zToa") {
      sortOptions.name = -1;
    }
  
    const skip = (page - 1) * limit;
  
    const products = await productDB
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", { name: 1 })
      .populate("brand", { name: 1 })
      .populate("tag", { tagName: 1 });
  
    const totalAvailableProducts = await productDB.countDocuments(filter);
  
    res.status(200).json({
      products,
      totalAvailableProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalAvailableProducts / limit),
    });
} catch (error) {
  console.log("category render erro:",error);
}
 
};

//get all products
exports.getProducts = async (req, res) => {
  try {
    const {
      tag,
      category,
      brand,
      size,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    let filter = {
      "variants.status": { $in: ["published", "low quantity"] },
      isActive: true,
    };

    // Gender filter
    if (tag) {
      filter.tag = { $in: tag.split(",") };
    }

    // Category filter
    if (category) {
      filter.category = { $in: category.split(",") };
    }

    // Brand filter
    if (brand) {
      filter.brand = { $in: brand.split(",") };
    }

    // Size filter
    if (size) {
      filter["variants.size"] = { $in: size.split(",") };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.offerAmount = {};
      if (minPrice) filter.offerAmount.$gte = parseFloat(minPrice);
      if (maxPrice) filter.offerAmount.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }

        // Sorting
        let sortOptions = {};
        if (sort == 'LowtoHigh') {
          sortOptions.offerAmount = 1;
        } else if (sort == 'HightoLow') {
          sortOptions.offerAmount = -1;
        } else if(sort == 'Newest') {
          sortOptions.createdAt = -1; 
        }else if(sort == 'aToz' ){
          sortOptions.name = 1;
        }else if(sort == 'zToa' ){
          sortOptions.name = -1;
        }

    const skip = (page - 1) * limit;

    const products = await productDB
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", { name: 1 })
      .populate("brand", { name: 1 })
      .populate("tag", { tagName: 1 });

    const totalAvailableProducts = await productDB.countDocuments(filter);

    res.status(200).json({
      products,
      totalAvailableProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalAvailableProducts / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//search product
exports.searchProduct = async (req, res) => {
  try {
    const searchInput = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;

    if (!searchInput) {
      return res.status(400).send("Search input is required");
    }

    // Fetch category, brand, and tag concurrently
    const [category, brand, tag] = await Promise.all([
      Category.findOne({ name: { $regex: searchInput, $options: "i" } }),
      Brand.findOne({ name: { $regex: searchInput, $options: "i" } }),
      Tag.findOne({ tagName: { $regex: `^${searchInput}$`, $options: "i" } }),
    ]);

    // Build the search criteria
    const searchOptions = {
      isActive: true,
      $or: [{ name: { $regex: searchInput, $options: "i" } }],
    };

    // Add category, brand, and tag to search criteria if found
    if (category) searchOptions.$or.push({ category: category._id });
    if (brand) searchOptions.$or.push({ brand: brand._id });
    if (tag) searchOptions.$or.push({ tag: tag._id });

    // Fetch products with related data
    const skip = (page - 1) * limit;
    const products = await productDB
      .find(searchOptions)
      .populate("brand")
      .populate("category")
      .populate("tag")
      .skip(skip)
      .limit(limit);

    const totalAvailableProducts = await productDB.countDocuments(searchOptions);
    // Fetch user details, categories, sizes, brands, and tags concurrently
    const [userDetails, categorys, sizes, brands, tags, cart] =
      await Promise.all([
        userDB.findOne({ email: req.session.userGmail }),
        Category.find({ isActive: true }),
        Size.find({ isActive: true }),
        Brand.find({ isActive: true }),
        Tag.find({ isActive: true }),
        cartDB.findOne({ userId: req.session.userId }),
      ]);

    const cartLength = cart?.cart?.length || 0;

    res.render("user/pages/category", {
      cartLength,
      user: userDetails,
      products,
      title: "Category",
      categorys,
      sizes,
      brands,
      totalPages: Math.ceil(totalAvailableProducts / limit),
      currentPage: page,
      tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
