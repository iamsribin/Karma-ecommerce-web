const userDB = require("../../models/userModels/userModel");
const productDB = require("../../models/adminModels/product");
const cartDB = require("../../models/userModels/cartModel");
//render home page
exports.home = async (req, res) => {
  try {
    if(req.session.otpverfication){
      await userDB.deleteOne({ otp: { $exists: true } });
      req.session.destroy((err) => {
        if (err) {
    
          return next(createError(null, null));
        }
        // return res.json({ loggedIn: false, redirectTo: "/" });
      });
    }
    const user = req.session?.userGmail;

    let userDetalis = null;
    let cartLength = 0;
    if (user) {
     userDetalis = await userDB.findOne({email: req.session.userGmail});
     const cart = await cartDB.findOne({userId: req.session.userId});
     cartLength = cart?.cart?.length;
    }



    const products = await productDB.find({})
    .populate('brand')
    .populate('category')
    .populate('tag')
    return res.render("user/pages/home", {
      user: userDetalis,
      products: products,
      cartLength,
      title:"Home page"
    });
    
  } catch (error) {
    console.log("error:", error);
  }
};

//render login page
exports.loginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  } else {
    return res.render("user/registration/login",);
  }
};


