const mongoose = require("mongoose");

const { Schema } = mongoose;

const CounterSchema = new Schema({
  model: {
    type: String,
    required: true,
    unique: true,
  },
  field: String,
  count: {
    type: Number,
    default: 1000,
    required: true,
  },
});

module.exports = mongoose.model("Counter", CounterSchema);