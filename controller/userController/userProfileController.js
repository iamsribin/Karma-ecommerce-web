const userDB = require("../../models/userModels/userModel");
const AddressDB = require("../../models/userModels/addressModel");
const mongoose = require("mongoose");
const UserDB = require("../../models/userModels/userModel");
const Order = require("../../models/userModels/orderModel");
const { createError } = require("../../utils/errors");
const cartDB = require("../../models/userModels/cartModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const Referral = require("../../models/adminModels/referral");
const Wallet = require("../../models/userModels/walletModel")

//render user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const id = req.session.userId;
    const userDetalis = await userDB.findOne({ _id: id });
    const addresses = await AddressDB.findOne({ userId: id });
    
    const cart = await cartDB.findOne({userId: req.session.userId});
    const cartLength = cart?.cart?.length;

    const wallet = await Wallet.findOne({user: id})
    .sort({createdAt: -1});

    const orders = await Order.find({ userId: id })
    .populate('products.productId')
    .populate('products.size')
    .populate("coupon")
    .sort({createdAt: -1})

    const referral = await Referral.findOne({  });

    res.render("user/pages/userProfile", {
      userDetalis,
      cartLength,
      user:userDetalis,
      addresses: addresses?.addresses,
      orders,
      referral,
      wallet,
    });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//edit user infor
exports.editUserInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const { name } = req.body;

    const existingUser = await userDB.findById(id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = { name };

    // Handle file upload and delete old profile picture if new one is uploaded
    if (req.file) {
      if (
        existingUser.profilePicture &&
        !existingUser.profilePicture.startsWith("http://") &&
        !existingUser.profilePicture.startsWith("https://")
      ) {
        const oldImagePath = path.join(
          process.cwd(),
          existingUser.profilePicture
        );

        fs.unlink(oldImagePath, (err) => {
          if (err) {
            return res.status(500).json({ message: "Server error" });
          }
        });
      }

      updateData.profilePicture = `/uploads/userProfile/${req.file.filename}`;
    }

    const updatedUser = await userDB.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//create addressess
exports.createAddressess = async (req, res, next) => {
  try {
      const userId = req.session.userId;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return next(createError(404, "Invalid user ID"));
      }

      console.log("add", req.body);

      const addressData = {
          fullName: req.body.name,
          phoneNumber: req.body.number,
          address: req.body.address,
          locality: req.body.locality,
          pincode: req.body.pincode,
          state: req.body.state,
          district: req.body.district,
          landMark: req.body.landmark,
          houseNo: req.body.houseNo,
          addressType: req.body.addressType,
      };

      const userAddress = await AddressDB.findOne({ userId });

      let newAddress;
      if (userAddress) {
          console.log("old address");
          userAddress.addresses.push(addressData);
          await userAddress.save();
          newAddress = userAddress.addresses[userAddress.addresses.length - 1];
      } else {
          const newAddressDocument = await AddressDB.create({
              userId,
              addresses: [addressData],
          });
          console.log("log new address");
          newAddress = newAddressDocument.addresses[0];
      }

      return res.status(200).send(newAddress);
  } catch (error) {
      console.log("error new address:", error);
      next(createError(500, error.message || "Internal Server Error"));
  }
};


//get Edit Address Details With Id
exports.getEditAddressDetailsWithId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const userAddressDoc = await AddressDB.findOne({ userId: userId });

    if (!userAddressDoc) {
      return res
        .status(404)
        .json({ message: "User address document not found" });
    }

    // Find the specific address within the addresses array
    const address = userAddressDoc.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json(address);
  } catch (error) {
    console.error("Error finding address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//edit Address
exports.getEditAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const address = await AddressDB.findOne({ _id: id });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json(address);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//edit user address
exports.editAddressDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    console.log("edit body",req.body);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createError(404, "Invalid user ID"));
    }

    const addressData = {
      fullName: req.body.name,
      phoneNumber: req.body.number,
      address: req.body.address,
      locality: req.body.locality,
      pincode: req.body.pincode,
      state: req.body.state,
      district: req.body.district,
      landMark: req.body.landmark,
      houseNo: req.body.houseNo,
      addressType: req.body.editaddressType,
    };

    const userAddressDoc = await AddressDB.findOne({ userId: userId });

    if (!userAddressDoc) {
      return res
        .status(404)
        .json({ message: "User address document not found" });
    }

    const addressIndex = userAddressDoc.addresses.findIndex(address => address._id.toString() === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    userAddressDoc.addresses[addressIndex] = {
      ...userAddressDoc.addresses[addressIndex]._doc,
      ...addressData,
    };

    await userAddressDoc.save();

    return res.status(200).send(userAddressDoc.addresses[addressIndex]);

  } catch (error) {
    return next(createError(null, null));
  }
};

//delete user address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.body;
    const userId = req.session.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(createError(404, "Invalid user ID"));
    }

    const userAddress = await AddressDB.findOne({ userId });

    if (!userAddress) {
      return next(createError(404, "User addresses not found"));
    }

    const addressIndex = userAddress.addresses.findIndex(
      (address) => address._id.toString() === id
    );

    if (addressIndex === -1) {
      return next(createError(404, "Address not found"));
    }

    userAddress.addresses.splice(addressIndex, 1);
    await userAddress.save();

    return res.status(200).json({userAddress});
  } catch (err) {
    console.log(err);
    return next(createError(500, "Failed to delete address"));
  }
};

//get orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.session.userId;; 
    const orders = await Order.find({ userId })
    .populate('products.productId')
    .populate('products.size')
    .sort({ createdAt: -1 }); 

    res.render('orders', { orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
};

//change password
exports.setNewPassword = async (req, res) => {
  try {
    const userId = req.session.userId;

    if(!userId){
      return res.status(404).redirect("/");
    }
    const { currPassword, newPassword } = req.body;

    const user = await UserDB.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(user.googleId){
      return res.status(404).json({ message: "Password change not available for Google sign-in users." });
    }

    const isMatch = await bcrypt.compare(currPassword, user.password);

    if(!isMatch){
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const updateData = { password:  hashedPassword };
    await UserDB.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.status(200).json({message:"success"})

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "something went wrong" });
  }
}