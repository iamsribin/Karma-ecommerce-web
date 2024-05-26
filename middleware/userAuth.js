
//check user login or not
exports.userExit = async (req, res, next) => {
    if (!req.session.user) {
      next();
  
    } else {
      return res.redirect("/");
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
  
  exports.isPasswordChangingProcess = async (req, res, next) =>{
    if (req.session.passwordChange) {
      next();
    } else {
      return res.redirect("/login");
    }
  }
