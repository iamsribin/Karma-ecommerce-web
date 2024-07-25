const mongoose = require("mongoose");
const Category = require("../adminModels/category");
const Brand = require("../adminModels/brand");
const Tag = require("./tag");
const Size = require("../adminModels/size");
const CategoryOffer = require("../adminModels/categoryOffer");
const { Schema } = mongoose;

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    basePrice: { type: Number },
    offerAmount: { type: Number },
    offerExpiryDate: { type: Date },
    categoryOfferAmount: { type: Number },
    categoryOfferExpiryDate: { type: Date },
    brand: { type: Schema.Types.ObjectId, ref: Brand },
    category: { type: Schema.Types.ObjectId, ref: Category },
    foreFoot: { type: Number },
    midsoleDrop: { type: Number },
    heel: { type: Number },
    weight: { type: Number },
    imagePaths: [{ type: String }],
    numberOfReviews: { type: Number },
    rating: { type: Number },
   
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
          },
          status: {
            type: String,
            enum: [
              "draft",
              "published",
              "out of stock",
              "low quantity",
              "unpublished",  
            ],
          },
      }
  ],
  totalQuantity: { type: Number},
    isActive: {
      type: Boolean,
      default: true,
    },
    status: { type: String },
      },
  { timestamps: true }
);

productSchema.methods.checkAndUpdateOffers = async function() {
  const now = new Date();
  let isModified = false;
  
  if (this.offerExpiryDate && this.offerExpiryDate < now) {
    this.offerAmount = undefined;
    this.offerExpiryDate = undefined;
    isModified = true;
  }
  
  if (this.categoryOfferExpiryDate && this.categoryOfferExpiryDate < now) {
    this.categoryOfferAmount = undefined;
    this.categoryOfferExpiryDate = undefined;
    isModified = true;
  }
  
  // Check for category offer if product offer is not active
  if (!this.offerAmount) {
    const categoryOffer = await CategoryOffer.findOne({
      category_id: this.category,
      expiryDate: { $gt: now }
    });
    
    if (categoryOffer) {
      this.categoryOfferAmount = (categoryOffer.offerPercentage * this.basePrice) / 100;
      this.categoryOfferExpiryDate = categoryOffer.expiryDate;
      isModified = true;
    }
  }
  
  if (isModified) {
    await this.save();
  }
};

module.exports = mongoose.model("Product", productSchema);
