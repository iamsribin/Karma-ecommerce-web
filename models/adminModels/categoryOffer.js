const mongoose = require("mongoose");
const categories = require("./category");

const { Schema } = mongoose;

const OfferSchema = new Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: categories,
    },
    offerPercentage: {
        type:Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

const offer = mongoose.model('CategoryOffer',OfferSchema);
module.exports = offer;