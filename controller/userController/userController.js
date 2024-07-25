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
      });
    }
    const user = req.session?.userId;
    
    let userDetalis = null;
    let cartLength = 0;
    if (user) {
      userDetalis = await userDB.findOne({_id: req.session.userId});
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
      { $limit: 6 },
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
        _id: "$productDetails._id",
        name: "$productDetails.name",
        description: "$productDetails.description",
        basePrice: "$productDetails.basePrice",
        offerAmount: "$productDetails.offerAmount",
        offerExpiryDate: "$productDetails.offerExpiryDate",
        categoryOfferAmount: "$productDetails.categoryOfferAmount",
        categoryOfferExpiryDate: "$productDetails.categoryOfferExpiryDate",
        brand: "$brandDetails",
        category: "$categoryDetails",
        tag: "$tagDetails",
        imagePaths: "$productDetails.imagePaths",
        totalQuantity: "$productDetails.totalQuantity",
        rating: "$productDetails.rating",
        isActive: "$productDetails.isActive",
        createdAt: "$productDetails.createdAt"
      }}
    ]);

    const recentProducts = await productDB.find({})
      .populate('brand')
      .populate('category')
      .populate('tag')
      .sort({createdAt: -1})
      .limit(6);
    
    return res.render("user/pages/home", {
      user: userDetalis,
      topProducts: topProducts,
      recentProducts: recentProducts,
      cartLength,
      title: "Home page"
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

exports.renderContact = async (req, res) =>{
  const user = req.session?.userId;
    
  let userDetalis = null;
  let cartLength = 0;
  if (user) {
    userDetalis = await userDB.findOne({_id: req.session.userId});
    const cart = await cartDB.findOne({userId: req.session.userId});
    cartLength = cart?.cart?.length;
  }
  return res.status(200).render("user/pages/contact",{
    user: userDetalis,
    cartLength,
    title: "Contact page"
  });
}
