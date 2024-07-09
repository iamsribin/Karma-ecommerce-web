const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const User = require("../userModels/userModel");

const userAddressSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: User,
        required: true,
    },
    addresses: [{
        fullName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
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
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = model("userAddress", userAddressSchema);
