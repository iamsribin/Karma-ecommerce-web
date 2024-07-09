const Payment = require("../../models/userModels/paymentModel");


exports.renderPaymentsList = async (req, res) =>{
 try {
    const paymentList = await Payment.find({});
    console.log("pymentlisdt",paymentList);
    return  res.render("admin/adminDasbord/payments",{paymentList});
 } catch (error) {
    console.log(error);
 }
}