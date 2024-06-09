const mongo = require("mongoose");
const { Schema, model } = mongo;
const { ObjectId } = mongo.Schema.Types;
const userAddressSchema = Schema({
    
    userId: {
		type: ObjectId,
		required: true
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
		email: {
			type: String,
			required: true
		},
		building: {
			type: String,
			required: true
		},
		houseNumber: {
			type: String,
			required: true,
			unique: false
		},
		country: {
			type: String,
			required: true
		},
		pincode: {
			type: Number,
			required: true
		},
		street: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		area: {
			type: String,
			required: true
		},
		circle: {
			type: String,
			required: true
		},
		region: {
			type: String,
			required: true
		},
		division: {
			type: String,
			required: true
		},
		location: {
			type: String,
			required: true
		},
		district: {
			type: String,
			required: true
		},
	}],
	status: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

module.exports = model("userAddress", userAddressSchema);
