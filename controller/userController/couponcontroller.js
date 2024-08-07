const Coupon = require("../../models/adminModels/coupon");
const Cart = require("../../models/userModels/cartModel");

exports.checkCoupon = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (cart.coupon) {
      const coupon = await Coupon.findOne({ _id: cart.coupon });

      if (
        coupon.minimumPurchaseAmount &&
        coupon.minimumPurchaseAmount > cart.grandTotal
      ) {

        cart.coupon = null;
        cart.couponCode = null,
        cart.couponDiscount = null,
        await cart.save();
      }
    }
  } catch (error) {
   console.log(error);
};
}

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.session.userId;
    const currentDate = new Date();

    const coupon = await Coupon.findOne({
      couponCode:code,
      expiryDate: { $gt: currentDate },
    });

    if (!coupon) {
      throw Error("Coupon not found!!");
    }

    if (coupon.currentUsageCount === coupon.maximumUses) {
      throw Error("Coupon Usage Limit Reached");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw Error("Cart not found!");
    }

    if (cart.grandTotal < coupon.minimumPurchaseAmount) {
      throw Error("Coupon Minimum Purchase Amount is not reached");
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          coupon: coupon._id,
          couponCode: code,
          couponDiscount: coupon.offerAmount,
        },
      }
    );

    if (!updatedCart) {
      throw Error("Cart couldn't update!");
    }

    res.status(200).json({
      discount: coupon.offerAmount,
      couponCode: code,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//remove coupon 
exports.removeCoupon = async (req, res) => {
    try {
      
        const _id = req.session.userId;
      await Cart.findOneAndUpdate(
        { userId: _id },
        {
          $set: {
            coupon: null,
            couponCode: null,
            couponDiscount: null,
          },
        },
        { new: true }
      );
  
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };