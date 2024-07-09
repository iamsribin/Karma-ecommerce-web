const orderDB= require("../../models/userModels/orderModel");
const mongoose = require("mongoose");
const Products = require("../../models/adminModels/product");
const Size = require("../../models/adminModels/size");
const User = require("../../models/userModels/userModel");
const Tag = require("../../models/adminModels/tag");
const Payment = require("../../models/userModels/paymentModel");
const uuid = require("uuid");

exports.listOrders = async (req, res, next) =>{
    try {
        const orders = await orderDB.find({"products.status" :{
          $in: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "canceled",
          ]}
    }).sort({ createdAt: -1 }); 
        res.render("admin/adminDasbord/orders",{orders});
    } catch (error) {
        
    }
}

exports.renderViewOrder = async (req, res, next) =>{
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).render('errorPages/404');
          }      

          const order = await orderDB.findOne({
            _id: id,
            "products.status": {
              $in: ["pending", "processing", "shipped", "delivered", "canceled"]
            }
          })
          .populate({
            path: 'userId',
            model: User,
            select: '-password'
          })
          .populate({
            path: "products.productId",
            model: Products
          })
          .populate({
            path: "products.size",
            model: Size
          });
          
        res.render("admin/adminDasbord/viewOrder",{order});
    } catch (error) {
        console.log(error);
    }
}

//update order
exports.updateProductStatus = async (req, res) => {
  try {
    const { orderId, productId, newStatus } = req.body;

    const order = await orderDB.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const product = order.products.id(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.statusHistory.push(
       {
      status: newStatus,
      date: Date.now(),
    },
  )

    if(newStatus === "delivered"){
      product.deliveryDate = new Date();
      product.status = newStatus;
    }else{
      product.status = newStatus;
    }

    await order.save();

    if(order.paymentMethod === "cashOnDelivery" && newStatus === "delivered"){
      await Payment.create({
        orderId: order._id,
        payment_id: `cod_${uuid.v4()}`,
        user: order.userId,
        status: "success",
        paymentMode: "cashOnDelivery",
      });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
