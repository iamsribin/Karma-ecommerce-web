const userDB = require("../../models/userModels/userModel");
const productDB = require("../../models/adminModels/product");
const cartDB = require("../../models/userModels/cartModel");
const Order = require("../../models/userModels/orderModel");
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


    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $lookup: {
          from: "brands",
          localField: "productDetails.brand",
          foreignField: "_id",
          as: "brandDetails"
        }
      },
      { $unwind: "$brandDetails" },
      { $lookup: {
          from: "caregories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      { $lookup: {
          from: "tags",
          localField: "productDetails.tag",
          foreignField: "_id",
          as: "tagDetails"
        }
      },
      { $unwind: "$tagDetails" },
      { $project: {
          name: "$productDetails.name",
          image: "$productDetails.imagePaths",
          offerPrice: "$productDetails.offerAmount",
          basePrice: "$productDetails.basePrice",
          brandName: "$brandDetails.name",
          categoryName: "$categoryDetails.name",
          tagName: "$tagDetails.tagName",
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ])


console.log("top:" ,topProducts);


    const products = await productDB.find({})
    .populate('brand')
    .populate('category')
    .populate('tag')



    return res.render("user/pages/home", {
      user: userDetalis,
      products: products,
      cartLength,
      topProducts,
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


