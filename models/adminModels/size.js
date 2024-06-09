const mongoose = require("mongoose")
require('dotenv').config();

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports =  mongoose.model('Size', sizeSchema);
