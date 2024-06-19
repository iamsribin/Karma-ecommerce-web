const userDB = require("../../models/userModels/userModel");
const AddressDB = require("../../models/userModels/addressModel");
const mongoose = require("mongoose");
const UserDB = require("../../models/userModels/userModel");
const { createError } = require("../../utils/errors");
const cartDB = require("../../models/userModels/cartModel");
const fs = require("fs");
const path = require("path");

//render user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const id = req.session.userId;
    const userDetalis = await userDB.findOne({ _id: id });
    const addresses = await AddressDB.findOne({ userId: id });
    
    const cart = await cartDB.findOne({userId: req.session.userId});
    const cartLength = cart?.cart?.length;

    console.log(userDetalis, addresses);
    res.render("user/pages/userProfile", {
      userDetalis,
      cartLength,
      user:userDetalis,
      addresses: addresses?.addresses,
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

    if (userAddress) {
      userAddress.addresses.push(addressData);
      await userAddress.save();
    } else {
      await AddressDB.create({
        userId,
        addresses: [addressData],
      });
    }
    
    return res.status(200).send(addressData);
  } catch (error) {
    console.log(error);
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

    return res.status(200).send(userAddress);
  } catch (err) {
    console.log(err);
    return next(createError(500, "Failed to delete address"));
  }
};
