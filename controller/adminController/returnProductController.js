const userDB = require("../../models/userModels/userModel");
const cartDB = require("../../models/userModels/cartModel");
const AddressDB = require("../../models/userModels/addressModel");
const Products = require("../../models/adminModels/product");
const Size = require("../../models/adminModels/size");
const orderDB = require("../../models/userModels/orderModel");
const Counter = require("../../models/userModels/counterModel");
const Payment = require("../../models/userModels/paymentModel");
const Wallet = require("../../models/userModels/walletModel");
const uuid = require("uuid");

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



// render returns products
exports.renderReturnProducts = async (req, res, next) => {
  try {
    const orders = await orderDB.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: {
          "products.status": { $in: ["return request", "return approved", "return rejected", "pickup completed", "returned"] }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "products.productDetails"
        }
      },
      {
        $lookup: {
          from: "sizes",
          localField: "products.size",
          foreignField: "_id",
          as: "products.sizeDetails"
        }
      },
      {
        $unwind: "$products.productDetails"
      },
      {
        $unwind: "$products.sizeDetails"
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          statusHistory: 1,
          address: 1,
          subTotal: 1,
          tax: 1,
          totalPrice: 1,
          product: {
            productId: "$products.productId",
            quantity: "$products.quantity",
            totalPrice: "$products.totalPrice",
            size: "$products.sizeDetails",
            price: "$products.price",
            offerPrice: "$products.offerPrice",
            status: "$products.status",
            resone: "$products.resone",
            productDetails: "$products.productDetails"
          },
          paymentMethod: 1,
          totalQuantity: 1,
          discount: 1,
          deliveryDate: 1,
          createdAt: 1,
          updatedAt: 1,
          orderId: 1
        }
      }
    ]);

    console.log("orders",orders[4]);

    res.render("admin/adminDasbord/returnProducts", { orders });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.updateReturnStatus = async (req, res, next) =>{
  try {
    const { orderId, productId, newStatus } = req.body;
    console.log( orderId, productId, newStatus );
    
    const order = await orderDB.findOneAndUpdate(
      { orderId, "products.productId": productId },
      { $set: { "products.$.status": newStatus },
      $push: {
        "products.$.statusHistory": {
          status: newStatus,
          date: Date.now(),
        },
      },
    },
      { new: true }
    );

    if(!order){
      return res.status(404).json({message: "Order or product not found"});
    }

    const index = order.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    console.log(index);

    if (index < 0) {
      return res.status(404).json({ message: "Product not found in order" });
    }

    const returnedProduct = order.products[index];

    // Update product stock
    updateProductList(
      returnedProduct.productId,
      returnedProduct.quantity,
      returnedProduct.size
    );


    if (order.paymentMethod !== "cashOnDelivery") {
      // Adding the refund to wallet of user.

      await Payment.create({
        orderId: returnedProduct.orderId,
        amount: returnedProduct.totalPrice,
        payment_id: `wallet_${uuid.v4()}`,
        user: order.userId,
        status: "refunded",
        paymentMode: "wallet",
        product: returnedProduct._id,
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
      const exists = await Wallet.findOne({ user: order.userId });
      if (exists) {
        wallet = await Wallet.findByIdAndUpdate(exists._id, {
          $inc: {
            balance: returnedProduct.totalPrice,
          },
          $push: {
            transactions: {
              transaction_id: counter.count + 1,
              amount: returnedProduct.totalPrice,
              type: "credit",
              description: "Order Cancellation Refund",
              orderId: order._id,
              product: returnedProduct.productId,
            },
          },
        });
      } else {
        wallet = await Wallet.create({
          user: order.userId,
          balance: returnedProduct.totalPrice,
          transactions: [
            {
              transaction_id: counter.count + 1,
              amount: returnedProduct.totalPrice,
              type: "credit",
              description: "Order Cancellation Refund",
              orderId: order._id,
              product: returnedProduct.productId,
            },
          ],
        });
      }
    }

    res.status(200).json({message: "Successfully updated"});
  } catch (error) {
    console.log(error);
    res.status(400).json({message: "somthing went wrong"});
  }
}


exports.returnProductView = async (req, res )=>{
  try {
    const orderId = req.params.orderId;
    const productId = req.params.productId;

    const order = await orderDB.findOne({orderId: orderId})      
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
    const orderProduct = order.products.find((item) => item.productId._id.equals(productId));

    if (!orderProduct)
      return res.status(404).json({ message: "Product not found in order" });


    res.render("admin/adminDasbord/returnProductView", { order,orderProduct });
  } catch (error) {
    console.log(error);
  }
}