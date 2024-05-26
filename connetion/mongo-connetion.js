const mongoose = require("mongoose");
const Coupon = require("../models/adminModels/coupon");

const connectToDatabase = async () => {
  try {

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await Coupon.syncIndexes();
    console.log('Database connected');

  } catch (error) {
    console.error('Database connection error:', error);
  }
};

module.exports = connectToDatabase;