
const Order = require("../../models/userModels/orderModel");
const User = require("../../models/userModels/userModel");
const mongoose = require("mongoose");
const Review = require("../../models/userModels/reviewModel");
const Product = require("../../models/adminModels/product")

// Creating a new review for each product
exports.createNewReview = async (req, res) => {
    try {

        //rating, productid, discription, orderid
        const userId = req.session.userId;
      const body = req.body;

      console.log("body",body);
  
      if (!mongoose.Types.ObjectId.isValid(body.order)) {
        const order = await Order.findOne({ orderId: body.order });
        body.order = order._id;
      }
  
      const reviewExists = await Review.findOne({
        userId: userId,
        product: body.product,
        order: body.order,
      });
  
      if (reviewExists) {
        throw Error("You have already reviewed. Please go to view page");
      }
  
      const product = await Product.findOne({ _id: body.product });
      if (!product) {
        throw Error("Product not found");
      }
  
      let newRating = body.rating;
      let newNumberOfReviews = 1;
  
      if (product.rating !== undefined && product.numberOfReviews !== undefined) {
        newRating =
          (product.rating * product.numberOfReviews + body.rating) /
          (product.numberOfReviews + 1);
        newNumberOfReviews = product.numberOfReviews + 1;
      }
  
      const updatedProduct = await Product.findByIdAndUpdate(
        body.product,
        {
          $set: {
            rating: newRating,
            numberOfReviews: newNumberOfReviews,
          },
        },
        { new: true }
      );
  
      const review = await Review.create({ ...body, userId });
  
      res.status(200).json({ review, updatedProduct });
    } catch (error) {
        console.log(error);
     return res.status(400).json({ error: error.message });
    }
  };    

  //edit review
  // Edit review
exports.editReview = async (req, res) => {
  try {
    console.log("edit body",req.body);
      const { order, rating, Description, product } = req.body;
      const userId = req.session.userId;

      const existingReview = await Review.findOne({ userId, product });
      if (!existingReview) {
          throw Error("Review not found");
      }

      const productData = await Product.findById(product);
      if (!productData) {
          throw Error("Product not found");
      }

      // Recalculate product rating by removing the effect of the old review
      let newRating = (productData.rating * productData.numberOfReviews - existingReview.rating + rating) / productData.numberOfReviews;

      const updatedProduct = await Product.findByIdAndUpdate(
          product,
          { rating: newRating },
          { new: true }
      );

      const updatedReview = await Review.findOneAndUpdate(
          { userId, product },
          { rating, Description },
          { new: true }
      );

      res.status(200).json({ updatedReview, updatedProduct });
  } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    console.log("delete body",req.body);
      const { product, order } = req.body;
      const userId = req.session.userId;

      const reviewToDelete = await Review.findOne({ userId, product });
      if (!reviewToDelete) {
          throw Error("Review not found");
      }

      const productData = await Product.findById(product);
      if (!productData) {
          throw Error("Product not found");
      }

      // Recalculate product rating by removing the effect of the review
      let newRating = 0;
      let newNumberOfReviews = productData.numberOfReviews - 1;
      if (newNumberOfReviews > 0) {
          newRating = (productData.rating * productData.numberOfReviews - reviewToDelete.rating) / newNumberOfReviews;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
          product,
          {
              rating: newRating,
              numberOfReviews: newNumberOfReviews,
          },
          { new: true }
      );

      await Review.findByIdAndDelete(reviewToDelete._id);

      res.status(200).json({ message: "Review deleted successfully", updatedProduct });
  } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
  }
}