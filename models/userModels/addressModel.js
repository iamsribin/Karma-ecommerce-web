const mongo = require("mongoose");
const { Schema, model } = mongo;
const { ObjectId } = mongo.Schema.Types;
const User = require("../userModels/userModel");


const userAddressSchema = Schema({
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
