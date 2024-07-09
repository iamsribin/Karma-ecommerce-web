const mongoose = require("mongoose");
const User = require("./userModel");
const Order = require("./orderModel");
const Product = require("../adminModels/product");

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: Product,
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: Order,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    Description: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
