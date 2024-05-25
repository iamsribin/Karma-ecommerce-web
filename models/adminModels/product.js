const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    basePrice: Number,
    offerAmount: Number,
    offerExpiryDate: String,
    brand: String,
    category: String,
    quantity: Number,
    qualityChecking: String,
    width: Number,
    height: Number,
    weight: Number,
    imagePaths: [String],
    status: {
      type: Boolean,
      default: true,
  }
  });
  
  module.exports = mongoose.model('Product', productSchema);