const mongoose = require("mongoose");
const Category = require("../adminModels/category");
const Brand = require("../adminModels/brand");
const Tag = require("./tag");
const Size = require("../adminModels/size");
const { Schema } = mongoose;

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    basePrice: { type: Number },
    offerAmount: { type: Number },
    offerExpiryDate: { type: Date },
    brand: { type: Schema.Types.ObjectId, ref: Brand },
    category: { type: Schema.Types.ObjectId, ref: Category },
    foreFoot: { type: Number },
    midsoleDrop: { type: Number },
    heel: { type: Number },
    weight: { type: Number },
    imagePaths: [{ type: String }],
    numberOfReviews: { type: Number },
    rating: { type: String },
    tag: { type: Schema.Types.ObjectId, ref: Tag },
    variants: [
      {
          size: {
              type: Schema.Types.ObjectId,
              ref: Size,
          },
          quantity: {
              type: Number,
              min: 0
          }
      }
  ],
  totalQuantity: { type: Number},
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
