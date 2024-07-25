const Payment = require("../../models/userModels/paymentModel");

exports.renderPaymentsList = async (req, res) =>{
 try {
    const paymentList = await Payment.find({});
    return  res.render("admin/adminDasbord/payments",{paymentList});
 } catch (error) {
res.status(500).json({message: "internal error"})
 }
}