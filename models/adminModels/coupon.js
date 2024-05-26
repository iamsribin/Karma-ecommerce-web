const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    couponCode: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    offerAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    minimumPurchaseAmount: { type: Number, default: null },
    maximumUses: { type: Number, default: null },
    currentUsageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index on couponCode and isActive
couponSchema.index({ couponCode: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model("Coupon", couponSchema);

