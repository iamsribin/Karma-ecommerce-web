const Coupon = require("../../models/adminModels/coupon");
const { createError } = require("../../utils/errors");
const mongoose = require("mongoose");

// Render coupons
exports.renderCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});

    const couponsWithExpiryStatus = coupons.map((coupon) => {
      const isExpired = coupon.expiryDate < Date.now();
      return {
        ...coupon.toObject(),
        isExpired,
      };
    });

    res.render("admin/adminDasbord/coupens", {
      coupons: couponsWithExpiryStatus,
    });
  } catch (error) {
    console.error("Error rendering coupons:", error);
    next(createError(500, "Internal Server Error"));
  }
};

// Render add coupon page
exports.renderAddCoupons = (req, res) => {
  res.render("admin/adminDasbord/addCoupons");
};

// Create new coupon
exports.addCoupon = async (req, res, next) => {
  try {
    const {
      couponCode,
      name,
      expiryDate,
      startDate,
      minimumPurchaseAmount,
      offerAmount,
      maximumUses,
    } = req.body;

    // Check if the coupon code already exists and is active
    const existingCoupon = await Coupon.findOne({
      couponCode,
      isActive: true,
    });

    if (existingCoupon) {
      return next(createError(400, "This coupon code already exists and is active!"));
    }

    const newCoupon = new Coupon({
      couponCode,
      name,
      expiryDate,
      startDate,
      minimumPurchaseAmount,
      offerAmount,
      maximumUses,
    });

    await newCoupon.save();
    res.status(200).send(newCoupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    next(createError(null, null));
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid ID"));
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return next(createError(404, "Coupon not found"));
    }

    coupon.isActive = false;
    await coupon.save();

    res.status(200).send(coupon);
  } catch (error) {
    
    console.error("Error deleting coupon:", error);
    next(createError(null, null));
  }
};
