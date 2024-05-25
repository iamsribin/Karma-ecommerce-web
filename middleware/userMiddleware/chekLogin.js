const userDB = require("../../models/userModels/userModel");
const { createError } = require("../../utils/errors");


//check user login or not
const checkLogin = async (req, res, next) => {

  if (req.session.otpverfication) {
    return res.redirect("/getotp");

  } else if (!req.session.user) {
    next();

  } else {
    return res.redirect("/");
  }
};

//checking the user in the otp verification process
const checkOTPVerification = async (req, res, next) => {

  if (req.session.otpverfication) {
    next();

  } else if (req.session.user) {
    res.redirect("/");

  } else {
    return res.redirect("/login");
  }
};

const logout = async (req, res) => {
  try {
    req.logout();

    return res.redirect("/");
  } catch (error) {

    console.log("google log out error", error);
  }

  if (req.session.googleId) {
    res.redirect("/auth/logout");
  }

  req.session.destroy((err) => {
    req.logout();

    if (err) {

      return next(createError(null, null));
    }
    return res.json({ loggedIn: false, redirectTo: "/" });
  });
};

module.exports = {
  checkLogin,
  checkOTPVerification,
  logout,

};
