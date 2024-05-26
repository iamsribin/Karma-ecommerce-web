const userDB = require("../../models/userModels/userModel");
const bcrypt = require("bcrypt");
const { createError } = require("../../utils/errors");

// Login user
exports.find = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userDB.findOne({ email });
    if (!user) return next(createError(401, "Invalid email or password"));

    if (user.googleId) return next(createError(401, "Invalid email or password"));

    if(user.status == "blocked") return next(createError(401, "You blocked by admin"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(createError(401, "Invalid email or password"));

    req.session.user = user.name;

    return res.status(200).json({ name: user.name });
  } catch (error) {
    return next(createError(null, null));
  }
};

//render email page for otp
exports.renderEmailForForgetOtp = (req, res, next) => {
  res.render("user/registration/otpmailPage");
};

//render email page for forgot password
exports.postEmailForForgetOtp = async (req, res, next) => {
  try {
    const email = req.session.userGmail;
    
    return res.render("user/registration/forgotOtpPage", { email: email });
  } catch (error) {

    return next(createError(null, null));
  }
};

//save new password
exports.saveNewPassword = async (req, res, next) => {
  try {

    const email = req.session.userGmail;
    const password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userDB.findOne({ email });

    user.password = hashedPassword;

    await user.save();
    delete req.session.passwordChange;

    return res.redirect("/login");  
  } catch (error) {

    console.log("new password save error:", error);
  }
};

//logout user
exports.logout = async (req, res) => {
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

exports.update = (req, res) => {};

exports.delete = (req, res) => {};
