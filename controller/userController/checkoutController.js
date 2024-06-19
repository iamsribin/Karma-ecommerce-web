const userDB = require("../../models/userModels/userModel");
const cartDB = require("../../models/userModels/cartModel");
const AddressDB = require("../../models/userModels/addressModel");

exports.renderCheckoutPage = async (req, res, next) => {
  try {
    const userId = req.session?.userId;

    const userDetalis = await userDB.findOne({_id: userId});
    const userCart = await cartDB.findOne({ userId });
    const addresses = await AddressDB.findOne({ userId });

    const cartLength = userCart?.cart?.length;

    const totalItems = userCart?.cart.reduce( (accumilator ,element )=> {
        return accumilator += element.quantity;
      }, 0);

    res.render("user/pages/checkoutPage", { 
      cartLength, 
      user: userDetalis, 
      userCart,
      totalItems,
      addresses: addresses?.addresses, });
  } catch (error) {
    console.log(error);
  }
};

exports.placeOrder = async (req, res, next) =>{
  try {
    const {addressId, paymentMethod, address} = req.body;
console.log(addressId, paymentMethod, address);
    const userId = req.session.userId;

    if(!userId){
      return next(createError(401, "User not authenticated"));
    }

    const userCart = await cartDB.findOne({ userId });
    const product = await productDB.findByOne();
    
    const totalItems = userCart?.cart.reduce( (accumilator ,element )=> {
      return accumilator += element.quantity;
    }, 0);

const order = {};

// cheking the user entered the added address
    if(addressId){
      const userAddressDoc = await UserAddress.findOne({ userId });

      if (!userAddressDoc) {
        return res.status(404).json({ message: "User address document not found" });
      }
      const address = userAddressDoc.addresses.find(address => address._id.equals(addressId));
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

order = {
  user: userId,
  address: address,
  paymentMethod,
  tax: userCart.tax,
  totalQuantity: totalItems,
  totalPrice: userCart.grandTotal,
  products: product,
  statusHistory: 
  [
    {
      status: "pending",
    },
  ],
  subTotal: userCart.subTotal,
  discount: userCart.discount,
}
    }

  } catch (error) {
    console.log(error);
  }
}