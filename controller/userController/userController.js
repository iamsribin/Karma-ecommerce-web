const userDB = require("../../models/userModels/userModel");
const productDB = require("../../models/adminModels/product");

//render home page
exports.home = async (req, res) => {
  try {

    const user = req.session?.user;

    let userDetalis;

    if (user) {
      const id = user._id;

      userDetalis = await userDB.findOne({ id });
    }

    const products = await productDB.find({})
    .populate('brand')
    .populate('category')
    return res.render("user/pages/home", {
      user: userDetalis,
      products: products,
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


