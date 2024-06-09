const userDB = require("../../models/userModels/userModel");
const userModelAddress = require("../../models/userModels/userModelAddress");
const userAddress = require("../../models/userModels/userModelAddress");
exports.getUserProfile = async (req, res, next) =>{

   const userDetalis = await userDB.findOne({email: req.session.userGmail});
   const address = userModelAddress.findOne({email: req.session.userGmail});
    res.render("user/pages/userProfile",{userDetalis,address});
}

exports.getCart = async (req, res, next) =>{
    res.render("user/pages/cart")
}