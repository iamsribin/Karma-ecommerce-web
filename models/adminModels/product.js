const mongoose = require("mongoose");
const Category = require("../adminModels/category");
const Brand = require("../adminModels/brand");
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
    quantity: { type: Number },
    qualityChecking: { type: String },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    imagePaths: [{ type: String }],
    numberOfReviews: { type: Number },
    rating: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
