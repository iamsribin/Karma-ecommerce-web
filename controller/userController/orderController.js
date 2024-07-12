const userDB = require("../../models/userModels/userModel");
const cartDB = require("../../models/userModels/cartModel");
const AddressDB = require("../../models/userModels/addressModel");
const Products = require("../../models/adminModels/product");
const Size = require("../../models/adminModels/size");
const Order = require("../../models/userModels/orderModel");
const { createError } = require("../../utils/errors");
const Reviews = require("../../models/userModels/reviewModel");
const Payment = require("../../models/userModels/paymentModel");
const Counter = require("../../models/userModels/counterModel");
const Wallet = require("../../models/userModels/walletModel");
const uuid = require("uuid");
const mongoose = require("mongoose");
const {generateInvoicePDF} = require("../common/invoiceDowloadFuntion");
const Coupon = require("../../models/adminModels/coupon");

//function increment or decrement product count
const updateProductList = async (id, count, sizeId) => {
  try {
    const product = await Products.findById(id).exec();
    if (!product) {
      throw new Error("Product not found");
    }
    const variantIndex = product.variants.findIndex((item) =>
      item.size.equals(sizeId)
    );

    if (variantIndex === -1) {
      throw new Error("Product variant not found");
    }

    const variant = product.variants[variantIndex];

    if (count < 0 && variant.quantity < -count) {
      throw new Error(`${product.name} doesn't have enough stock`);
    }

    variant.quantity += count;
    product.totalQuantity += count;

    const newStatus = getProductStatus(product.totalQuantity);
    if (newStatus !== product.status) {
      product.status = newStatus;
    }
    await product.save();
  } catch (error) {
    console.error(error.message);
    throw new Error(` ${error.message}`);
  }
};

const getProductStatus = (totalQuantity) => {
  if (totalQuantity === 0) {
    return "out of stock";
  } else if (totalQuantity < 5) {
    return "low quantity";
  } else {
    return "published";
  }
};

//render checkoutPage
exports.renderCheckoutPage = async (req, res, next) => {
  try {
    const userId = req.session?.userId;

    const userDetalis = await userDB.findOne({ _id: userId });
    const userCart = await cartDB.findOne({ userId });
    if (!userCart) {
      return res.redirect("/cart");
    }
    const addresses = await AddressDB.findOne({ userId });

    const cartLength = userCart?.cart?.length;

    const totalItems = userCart?.cart.reduce((accumilator, element) => {
      return (accumilator += element.quantity);
    }, 0);

    const wallet = await Wallet.findOne({ user: userId });

    // balance
    res.render("user/pages/checkoutPage", {
      cartLength,
      user: userDetalis,
      userCart,
      totalItems,
      walletBalace: wallet?.balance,
      addresses: addresses?.addresses,
    });
  } catch (error) {
    console.log(error);
  }
};

//creating an order
exports.placeOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return next(createError(401, "User not authenticated"));
    }

    if (!addressId ) {
      return next(createError(400, "Address required"));
    }

    if (!paymentMethod) {
      return next(createError(400, "Payment method required"));
    }

    const userCart = await cartDB.findOne({ userId });

    const products = userCart.cart.map((item) => ({
      productId: item.product,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          date: Date.now(),
        },
      ],
      offerPrice: item.offerPrice ? item.offerPrice : undefined,
      totalPrice: item.offerPrice
        ? item.offerPrice * item.quantity
        : item.price * item.quantity,
    }));

    const totalItems = userCart?.cart.reduce((accumilator, element) => {
      return (accumilator += element.quantity);
    }, 0);

    let orderData = {};

    // cheking which address is user choose
      const userAddressDoc = await AddressDB.findOne({ userId });

      if (!userAddressDoc) {
        return res
          .status(404)
          .send({ message: "User address document not found" });
      }
      const address = userAddressDoc.addresses.find((address) =>
        address._id.equals(addressId)
      );

      if (!address) {
        return res.status(404).send({ message: "Address not found" });
      }
      const updatedAddress = {
        ...address,
        userId,
      };

      orderData = {
        userId: userId,
        address: updatedAddress,
        paymentMethod,
        // tax: userCart.tax,
        totalQuantity: totalItems,
        totalPrice: userCart.grandTotal,
        products: products,
        subTotal: userCart.subTotal,
        coupon: userCart.coupon,
        couponDiscount: userCart?.couponDiscount ?  userCart?.couponDiscount: null,
        discount: userCart?.discount ?  userCart?.discount : null,
      };

    const updateProductPromises = products.map((item) => {
      return updateProductList(item.productId, -item.quantity, item.size);
    });

    await Promise.all(updateProductPromises);


    if (userCart.coupon) {
      const coupon = await Coupon.findOne({ _id: userCart.coupon });
    
      if (coupon && coupon.maximumUses !== null) {
        await Coupon.findOneAndUpdate(
          { _id: userCart.coupon },
          { $inc: { currentUsageCount: 1 } }
        );
      }

      orderData.totalPrice -= userCart.couponDiscount;
    }

    const newOrder = await Order.create(orderData);

    if (newOrder) {
      await cartDB.findByIdAndDelete(userCart._id);
    }

    if (paymentMethod === "wallet") {
      const exists = await Wallet.findOne({ user: userId });
      if (!exists) {
        throw Error("No Wallet where found");
      }

      await Payment.create({
        orderId: newOrder._id,
        payment_id: `wallet_${uuid.v4()}`,
        user: userId,
        status: "success",
        paymentMode: "wallet",
      });

      let counter = await Counter.findOne({
        model: "Wallet",
        field: "transaction_id",
      });

      // Checking if order counter already exist
      if (counter) {
        counter.count += 1;
        await counter.save();
      } else {
        counter = await Counter.create({
          model: "Wallet",
          field: "transaction_id",
        });
      }

      let wallet = {};
      if (exists) {
        wallet = await Wallet.findByIdAndUpdate(exists._id, {
          $inc: {
            balance: -newOrder.totalPrice,
          },
          $push: {
            transactions: {
              transaction_id: counter.count + 1,
              amount: newOrder.totalPrice,
              type: "debit",
              description: "Product Ordered",
              order: newOrder._id,
            },
          },
        });
      }
    } 

  return res.status(200).json({ newOrder });
  } catch (error) {
    console.log("order eerr", error);
    res.status(400).send({ message: error.message });
  }
};

//render order confirmation page
exports.renderOrderConfirmationPage = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    const { id } = req.params;

    const order = await Order.findOne({ userId, _id: id })
      .populate({
        path: "products.productId",
        model: Products,
      })
      .populate({
        path: "products.size",
        model: Size,
      });

    const userDetalis = await userDB.findOne({ _id: userId });
    const userCart = await cartDB.findOne({ userId });

    return res.render("user/pages/orderConfirmationPage", {
      cartLength: userCart?.cart?.length,
      user: userDetalis,
      userCart,
      order,
    });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

// render view order
exports.renderOrderView = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    const { id, orderId } = req.params;

    console.log("id:", id, "orderId:", orderId);

    const order = await Order.findOne({ userId, orderId })
      .populate({
        path: "products.productId",
        model: "Product",
        populate: [
          { path: "category", model: "Caregory" },
          { path: "tag", model: "Tag" },
          { path: "brand", model: "Brand" },
        ],
      })
      .populate({
        path: "products.size",
        model: "Size",
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderProduct = order.products.find((item) => item._id.equals(id));

    if (!orderProduct)
      return res.status(404).json({ message: "Product not found in order" });
    const productReview = await Reviews.findOne({userId: userId, product: orderProduct.productId._id, order: order._id})
    .populate("userId");

    const userDetalis = await userDB.findOne({ _id: userId });
    const userCart = await cartDB.findOne({ userId });

    return res.render("user/pages/orderView", {
      cartLength: userCart?.cart?.length,
      user: userDetalis,
      order,
      orderProduct,
      productReview
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//cancel product
exports.cancelOrder = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    console.log("enterd");
    const { productId, orderId, reason } = req.body;
    console.log(productId, orderId);

    const order = await Order.findOne({ userId, orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log(order);

    const index = order.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log(index);

    if (index < 0) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    const canceledProduct = order.products[index];

    // Update product stock
    updateProductList(
      canceledProduct.productId,
      canceledProduct.quantity,
      canceledProduct.size
    );

    // Update order and add status history
    await Order.updateOne(
      { userId, orderId, "products.productId": productId },
      {
        $set: {
          "products.$.status": "canceled",
        },
        $push: {
          "products.$.statusHistory": {
            status: "canceled",
            date: Date.now(),
            reason: reason,
          },
        },
      },
      { new: true }
    );

    if (order.paymentMethod !== "cashOnDelivery") {
      // Adding the refund to wallet of user.
      await Payment.findOneAndUpdate(
        { orderId: order._id },
        {
          $set: {
            status: "refunded",
          },
        }
      );

      let counter = await Counter.findOne({
        model: "Wallet",
        field: "transaction_id",
      });

      // Checking if order counter already exist
      if (counter) {
        counter.count += 1;
        await counter.save();
      } else {
        counter = await Counter.create({
          model: "Wallet",
          field: "transaction_id",
        });
      }

      let wallet = {};
      const exists = await Wallet.findOne({ user: userId });
      if (exists) {
        wallet = await Wallet.findByIdAndUpdate(exists._id, {
          $inc: {
            balance: order.totalPrice,
          },
          $push: {
            transactions: {
              transaction_id: counter.count + 1,
              amount: order.totalPrice,
              type: "credit",
              description: "Order Cancellation Refund",
              orderId: order._id,
              product: canceledProduct.productId,
            },
          },
        });
      } else {
        wallet = await Wallet.create({
          user: userId,
          balance: order.totalPrice,
          transactions: [
            {
              transaction_id: counter.count + 1,
              amount: order.totalPrice,
              type: "credit",
              description: "Order Cancellation Refund",
              orderId: order._id,
              product: canceledProduct.productId,
            },
          ],
        });
      }
    }

   return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
   return res.status(500).json({ message: "Internal Server Error" });
  }
};

//return product
exports.returnProduct = async (req, res, next) =>{
try {
  const userId = req.session?.userId;
  const { productId, orderId, reason } = req.body;

  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

   await Order.updateOne(
    { userId, orderId, "products.productId": productId },
    {
      $set: {
        "products.$.status": "return request",
      },
      $push: {
        "products.$.statusHistory": {
          status: "return request",
          date: Date.now(),
          reason: reason,
        },
      },
    },
    { new: true }
  );

 return res.status(200).json({ message: "return request sended successfully" });

} catch (error) {
  console.log(error);
}
}

// Generating pdf invoices
exports.generateOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    let find = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      find._id = id;
    } else {
      find.orderId = id;
    }

    const order = await Order.findOne(find).populate("products.productId");

    const pdfBuffer = await generateInvoicePDF(order);

    // Set headers for the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    res.status(200).end(pdfBuffer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//create order for faild orders
//  exports.createfailOrder = async (req, res) => {
//   try {

//     const {userId} = req.session.userId;

//     const { addressId, paymentMethod } = req.body;

//     if (!userId) {
//       return next(createError(401, "User not authenticated"));
//     }

//     if (!addressId ) {
//       return next(createError(400, "Address required"));
//     }

//     if (!paymentMethod) {
//       return next(createError(400, "Payment method required"));
//     }

//     const userCart = await cartDB.findOne({ userId });

//     const products = userCart.cart.map((item) => ({
//       productId: item.product,
//       size: item.size,
//       quantity: item.quantity,
//       price: item.price,
//       status: "pending",
//       statusHistory: [
//         {
//           status: "pending",
//           date: Date.now(),
//         },
//       ],
//       offerPrice: item.offerPrice ? item.offerPrice : undefined,
//       totalPrice: item.offerPrice
//         ? item.offerPrice * item.quantity
//         : item.price * item.quantity,
//     }));

//     const totalItems = userCart?.cart.reduce((accumilator, element) => {
//       return (accumilator += element.quantity);
//     }, 0);

//     let orderData = {};

//     // cheking which address is user choose
//       const userAddressDoc = await AddressDB.findOne({ userId });

//       if (!userAddressDoc) {
//         return res
//           .status(404)
//           .send({ message: "User address document not found" });
//       }
//       const address = userAddressDoc.addresses.find((address) =>
//         address._id.equals(addressId)
//       );

//       if (!address) {
//         return res.status(404).send({ message: "Address not found" });
//       }
//       const updatedAddress = {
//         ...address,
//         userId,
//       };

//       orderData = {
//         userId: userId,
//         address: updatedAddress,
//         paymentMethod,
//         // tax: userCart.tax,
//         totalQuantity: totalItems,
//         totalPrice: userCart.grandTotal,
//         products: products,
//         subTotal: userCart.subTotal,
//         discount: userCart.discount,
//       };

//     const updateProductPromises = products.map((item) => {
//       return updateProductList(item.productId, -item.quantity, item.size);
//     });

//     await Promise.all(updateProductPromises);

//     const newOrder = await Order.create(orderData);
//     if (newOrder) {
//       await cartDB.findByIdAndDelete(userCart._id);
//     }

//     console.log(newOrder);

//     if (paymentMethod === "wallet") {
//       const exists = await Wallet.findOne({ user: userId });
//       if (!exists) {
//         throw Error("No Wallet where found");
//       }

//       await Payment.create({
//         orderId: newOrder._id,
//         payment_id: `wallet_${uuid.v4()}`,
//         user: userId,
//         status: "success",
//         paymentMode: "wallet",
//       });

//       let counter = await Counter.findOne({
//         model: "Wallet",
//         field: "transaction_id",
//       });

//       // Checking if order counter already exist
//       if (counter) {
//         counter.count += 1;
//         await counter.save();
//       } else {
//         counter = await Counter.create({
//           model: "Wallet",
//           field: "transaction_id",
//         });
//       }

//       let wallet = {};
//       if (exists) {
//         wallet = await Wallet.findByIdAndUpdate(exists._id, {
//           $inc: {
//             balance: -newOrder.totalPrice,
//           },
//           $push: {
//             transactions: {
//               transaction_id: counter.count + 1,
//               amount: newOrder.totalPrice,
//               type: "debit",
//               description: "Product Ordered",
//               order: newOrder._id,
//             },
//           },
//         });
//       }
//     } 


//   return res.status(200).json({ newOrder });
//   } catch (error) {
//     console.log("order eerr", error);
//     res.status(400).send({ message: error.message });
//   }
// };