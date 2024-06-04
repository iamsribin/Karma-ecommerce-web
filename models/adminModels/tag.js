const mongoose = require("mongoose")

const tagSchema = new mongoose.Schema({
  tagName: {
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

module.exports = mongoose.model('Tag', tagSchema);

 