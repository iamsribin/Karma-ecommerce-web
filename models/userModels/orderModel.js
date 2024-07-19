const mongoose = require("mongoose");
const User = require("./userModel");
const Product = require("../adminModels/product");
const Coupon = require("../adminModels/coupon");
const Counter = require("./counterModel");
const Size = require("../adminModels/size");
const { Schema } = mongoose;

const AddressSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  landMark: {
    type: String,
  },
  houseNo: {
    type: String,
  },
  addressType: {
    type: String,
    enum: ["home", "work", "other"],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
});

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "canceled",
      "return request",
      "return approved",
      "return rejected",
      "pickup completed",
      "returned",
    ],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
  },
});

const ProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: Product,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  size: {
    type: Schema.Types.ObjectId,
    ref: Size,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "canceled",
      "return request",
      "return approved",
      "return rejected",
      "pickup completed",
      "returned",
    ],
    default: "pending",
  },
  statusHistory: [StatusHistorySchema],
  resone: {
    type: String,
  },
});

const OrderSchema = new Schema(
  {
    orderId: {
      type: Number,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    address: AddressSchema,
    deliveryDate: {
      type: Date,
      default: () => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 7); // For a week
        return currentDate;
      },
    },
    subTotal: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    products: [ProductSchema],
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cashOnDelivery", "razorPay", "wallet"],
    },
    totalQuantity: {
      type: Number,
      min: 0,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["failed", "pending", "success"],
      default: "pending",
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: Coupon,
    },
    couponDiscount:{
      type: Number,
    },
    discount: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Order ID generation
OrderSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const counter = await Counter.findOne({ model: "Order", field: "orderId" });

    // Checking if order counter already exist
    if (counter) {
      this.orderId = counter.count + 1;
      counter.count += 1;
      await counter.save();
    } else {
      await Counter.create({ model: "Order", field: "orderId" });
      this.orderId = 1000;
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("Order", OrderSchema);
