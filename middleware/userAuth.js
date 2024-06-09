//check user login or not
const UserDB = require("../models/userModels/userModel");

//user exist
exports.userExit = async (req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    return res.redirect("/");
  }
};

exports.verifyUser = async(req, res, next) => {
  if(req.session.user){
    next()
  }else{
    res.redirect("/login");
  }
}

exports.isBlock = async (req, res, next) => {
  const exitUser = await UserDB.findOne({ email: req.session.userGmail });

  if (exitUser?.status == "blocked" ) {
    return res.render("user/pages/adminBlockPage");
  } else {
    next();
  }
};

//checking the user in the otp verification process
exports.isOTPVerificationProcess = async (req, res, next) => {
  if (req.session.otpverfication) {
    next();
  } else {
    return res.redirect("/login");
  }
};

//checking the user in the passwordChanging process
exports.isPasswordChangingProcess = async (req, res, next) => {
  if (req.session.passwordChange) {
    next();
  } else {
    return res.redirect("/login");
  }
};
