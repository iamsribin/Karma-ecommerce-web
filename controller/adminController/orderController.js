const orderDB= require("../../models/userModels/orderModel");
const mongoose = require("mongoose");
const Products = require("../../models/adminModels/product");
const Size = require("../../models/adminModels/size");
const User = require("../../models/userModels/userModel");
const Payment = require("../../models/userModels/paymentModel");
const uuid = require("uuid");

//render order list
exports.listOrders = async (req, res, next) =>{
try {
      
  const orders = await orderDB.find({"products.status" :{
    $in:
     [ "pending", "processing", "shipped", "delivered", "canceled", ]
    },
    "paymentStatus" :{
       $in: [  "pending",  "success"]
      }
      }).sort({ createdAt: -1 }); 

    res.render("admin/adminDasbord/orders",{orders});

} catch (error) {
  res.status(500).json({ error: 'Internal Server Error' });
}     
}

// render order ditails page 
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
      res.status(500).json({ error: 'Internal Server Error' });    }
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

    if(order.paymentMethod === "cashOnDelivery" && newStatus === "delivered"){
      await Payment.create({
        orderId: order.orderId,
        payment_id: `cod_${uuid.v4()}`,
        user: order.userId,
        amount: product.totalPrice,
        status: "success",
        paymentMode: "cashOnDelivery",
      });
      order.paymentStatus = "success";
    }

    await order.save();

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
