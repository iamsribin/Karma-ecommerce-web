const RazorPay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../../models/userModels/paymentModel");

exports.createRazerPayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const instance = new RazorPay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        throw Error(error);
      }
      console.log("sendorder:",order);
      res.status(200).json({ order });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {

    const userId = req.session.userId;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature );

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      throw Error("Invalid Signature sent");
    }

    const payment = await Payment.create({
      ...req.body,
      payment_id: razorpay_payment_id,
      user: userId,
      status: "success",
      paymentMode: "razorPay",
    });

    return res
      .status(200)
      .json({ message: "Payment verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getKey = (req, res) => {
  return res.status(200).json({ key: process.env.KEY_ID });
};

