const mongoose = require("mongoose");
require('dotenv').config();
const Coupon = require('../../models/adminModels/coupon');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            size: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            productStatus: {
                type: String,
                default: 'pending'
            },
            price: {
                type: Number,
                required: true,
            },
            offerPrice:{
                    type: Number,
            }
        }
    ],
    coupon: {
        type: mongoose.Types.ObjectId,
        ref: Coupon,
      },
    subTotal:  { type: Number,default:0 },
    grandTotal: { type: Number,default:0 },
    discount: { type: Number, default: 0},
    cartStatus: {
        type: String,
        default: 'pending'
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
