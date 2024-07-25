const Wishlist = require("../../models/userModels/wishlistModel");
const mongoose = require("mongoose");
const Products = require("../../models/adminModels/product");
const User = require("../../models/userModels/userModel");
const Cart = require("../../models/userModels/cartModel");

// Getting entire wishlist of corresponding user
const getWishlist = async (req, res) => {
  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userDetails = await User.findById(userId).lean();
    const userCart = await Cart.findOne({ userId })
    .populate({
      path: "cart.product",
      model: "Product",
    })
    .populate({
      path: "cart.size",
      model: "Size",
    })

    const wishlist = await Wishlist.findOne({ user: userId })
    .populate({
        path: "items.product",
        model: "Product",
        select: "name imagePaths offerAmount basePrice category tag brand",
        populate: [
          {
            path: "category",
            model: "Caregory",
            select: "name",
          },
          {
            path: "brand",
            model: "Brand",
            select: "name",
          },
          {
            path: "tag",
            model: "Tag",
            select: "tagName",
          }
        ]
      })
      .sort({ createdAt: -1 });

    return res.render("user/pages/wishlist",{
      user: userDetails,
      cartProducts: userCart ? userCart.cart : null,
      cartLength: userCart ? userCart.cart.length : 0,
      wishlist
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a product to wishlist. Also if the wishlist doesn't exists it creates a new one
const addToWishlist = async (req, res) => {
  try {

    const userId = req.session.userId;

    if(!userId){
        throw Error("you didn't login trying to login");
    }

    const {productId} = req.body;
    const product = await Products.findById(productId);

    if (!product) {
      throw Error("Product not found");
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ product: productId }],
      });
    } else {
      const isProductInWishlist = wishlist.items.some(
        (pro) => pro.product.toString() === productId
      );

      if (!isProductInWishlist) {
        wishlist = await Wishlist.findOneAndUpdate(
          { _id: wishlist._id },
          {
            $push: {
              items: {
                product: productId,
              },
            },
          },
          { new: true }
        );
      } else {
        // Sending an error if it already exists in the wishlist
        throw Error("Already in Wishlist");
      }
    }
    
    return res.status(200).json({ message: "add to wishlist" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deleting entire wishlist
const deleteWishlist = async (req, res) => {
  try {
    const token = req.cookies.user_token;

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid user Id!!!");
    }

    const wishlistItem = await Wishlist.findOneAndDelete({ user: _id });
    if (!wishlistItem) {
      throw Error("No Such Wishlist");
    }

    res.status(200).json({ wishlistItem });
  } catch (error) {

    res.status(400).json({ error: error.message });
  }
};

// removing one product at a time from wishlist
const deleteOneProductFromWishlist = async (req, res) => {
  try {

    const userId = req.session.userId;

    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw Error("Invalid Product !!!");
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      throw Error("Couldn't find the wallet");
    }

    const product = await Products.findOne({ _id: productId });
    if (!product) {
      throw Error("Cannot find the product");
    }

    const updatedWishlist = await Wishlist.findByIdAndUpdate(
      wishlist._id,
      {
        $pull: {
          items: { product: productId },
        },
      },
      { new: true }
    );

    if (!updatedWishlist) {
      throw Error("Invalid Product");
    }
console.log("suceddd");
    res.status(200).json({ message: "successfully updated" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  deleteWishlist,
  deleteOneProductFromWishlist,
};
