const Cart = require("../../models/userModels/cartModel");
const { createError } = require("../../utils/errors");
const User = require("../../models/userModels/userModel");
const Size = require("../../models/adminModels/size");
const Product = require("../../models/adminModels/product");
const Coupon = require("../../models/adminModels/coupon");
const {checkCoupon} = require("../userController/couponcontroller");

const TAX_PERCENTAGE = 0.18;
// const HIGHER_TAX_PERCENTAGE = 0.18;

// Helper function to calculate totals
const calculateTotals = (cart, ) => {
  cart.tax = Math.ceil(cart.subTotal - cart.discount );
  cart.grandTotal = cart.subTotal - cart.discount;
};

// Render cart page
exports.renderCartPage = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return next(createError(401, "User not authenticated"));
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
    .lean();

    const currentDate = new Date();
  
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: currentDate },
      minimumPurchaseAmount: { $ne: null}
  });

  if(userCart?.coupon){
    checkCoupon(userId);
  }

  console.log("carts",userCart);

    return res.render("user/pages/cartPage", {
      user: userDetails,
      cartProducts: userCart ? userCart?.cart : null,
      cartLength: userCart ? userCart?.cart?.length : 0,
      userCart,
      coupons
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Failed to render cart page"));
  }
};

// Add to cart
exports.addCart = async (req, res, next) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.session.userId;   

    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const product = await Product.findById(productId);
    const userCart = await Cart.findOne({ userId });

    if (!product) {
      return next(createError(404, "Product not found"));
    }

    const price = product.basePrice;
    const offerPrice = product.offerAmount ? product.offerAmount: undefined;

    if (userCart) {
      const existingProductIndex = userCart.cart.findIndex(
        item => item.product.toString() === productId && item.size.toString() === size
      );

      if (existingProductIndex !== -1) {
        userCart.cart[existingProductIndex].quantity += parseInt(quantity, 10);
      } else {
        userCart.cart.push({ product: productId, size, quantity ,price, offerPrice});
      }

      userCart.subTotal += product.basePrice * quantity;
      userCart.discount += product.offerAmount ? (product.basePrice - product.offerAmount) * quantity : 0;
      calculateTotals(userCart);

      await userCart.save();
    } else {
      const subTotal = product.basePrice * quantity;
      const discount = product.offerAmount ? (product.basePrice - product.offerAmount) * quantity : 0;
      // const tax = Math.floor((subTotal - discount) * TAX_PERCENTAGE);
      const grandTotal = subTotal  - discount;

      await Cart.create({
        userId,
        cart: [{ product: productId, size, quantity, price, offerPrice}],
        subTotal,
        discount,
        // tax,
        grandTotal,
      });
    }

    return res.status(200).send({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Failed to add product to cart"));
  }
};

// Update cart quantity
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, size, action } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const productIndex = userCart.cart.findIndex(
      item => item.product.toString() === productId && item.size.toString() === size
    );

    if (productIndex === -1) {
      return res.status(404).send({ message: "Product not found" });
    }

    const product = await Product.findById(productId);
    const price = product.offerAmount || product.basePrice;

    if (action === "increment") {
      userCart.cart[productIndex].quantity += 1;
      userCart.subTotal += product.basePrice;
      userCart.discount += product.offerAmount ? product.basePrice - product.offerAmount : 0;
    } else if (action === "decrement") {
      userCart.cart[productIndex].quantity -= 1;
      userCart.subTotal -= product.basePrice;
      userCart.discount -= product.offerAmount ? product.basePrice - product.offerAmount : 0;

      if (userCart.cart[productIndex].quantity <= 0) {
        userCart.cart.splice(productIndex, 1);
      }
    } else {
      return res.status(400).send({ message: "Invalid action" });
    }

    calculateTotals(userCart);
    await userCart.save();

    if(userCart.coupon){
      checkCoupon(userId);
    }

    return res.status(200).send({ message: "Cart updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Failed to update cart quantity" });
  }
};

// Remove items from cart
exports.removeItemsFromCart = async (req, res, next) => {
  try {
    const { productId, sizeId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const productIndex = userCart.cart.findIndex(
      (cartItem) => cartItem.product.toString() === productId && cartItem.size.toString() === sizeId
    );

    if (productIndex === -1) {
      return res.status(404).send({ message: "Product not found in cart" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(createError(404, "Product not found"));
    }

    const quantity = userCart.cart[productIndex].quantity;
    userCart.subTotal -= product.basePrice * quantity;
    userCart.discount -= product.offerAmount ? (product.basePrice - product.offerAmount) * quantity : 0;
    calculateTotals(userCart);

    userCart.cart.splice(productIndex, 1);

    if (userCart.cart.length === 0) {
      await Cart.deleteOne({ _id: userCart._id });
    } else {
      await userCart.save();
    }

    checkCoupon(userId);

    return res.status(200).send({ message: "Product removed from cart successfully" });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Failed to remove items from cart"));
  }
};
