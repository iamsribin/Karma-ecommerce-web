
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
const checkOTPVerificationProcess = async (req, res, next) => {
  if (req.session.otpverfication) {
    next();

  } else {
    return res.redirect("/login");
  }
};

module.exports = {
  checkLogin,
  checkOTPVerification,
};
