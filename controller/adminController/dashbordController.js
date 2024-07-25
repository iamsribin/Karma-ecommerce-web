const Order = require('../../models/userModels/orderModel');
const moment = require('moment');

//render dashboard page
exports.renderDashboard = async (req, res) => {
  try {
    const { range = '1day' } = req.query;
    let startDate, endDate;

    switch (range) {
      case '1week':
        startDate = moment().subtract(1, 'weeks').startOf('day');
        endDate = moment().endOf('day');
        break;
      case '1month':
        startDate = moment().subtract(1, 'months').startOf('day');
        endDate = moment().endOf('day');
        break;
      default: // 1day
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
    }

    // Fetch sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fetch brand performance data
    const brandPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.brand",
          totalSales: { $sum: "$products.totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brandInfo"
        }
      },
      { $unwind: "$brandInfo" },
      {
        $project: {
          brandName: "$brandInfo.name",
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Fetch category performance data
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: { $sum: "$products.totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "caregories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          categoryName: "$categoryInfo.name",
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

  // Fetch top 10 selling brands
  const topBrands = await Order.aggregate([
    { $unwind: "$products" },
    { $lookup: {
        from: "products",
        localField: "products.productId",
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
    { $group: {
        _id: "$brandDetails._id",
        name: { $first: "$brandDetails.name" },
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: { $sum: "$products.totalPrice" },
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: "$products" },
    { 
      $match: { "products.status": "delivered" } 
    },
    { 
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: { $sum: "$products.totalPrice" },
        basePrice: { $first: "$products.price" },
        offerPrice: { $first: "$products.offerPrice" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    { 
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    { 
      $project: {
        name: "$productDetails.name",
        image: "$productDetails.imagePaths",
        basePrice: "$basePrice",
        offerPrice: "$offerPrice",
        numberOfReviews: "$productDetails.numberOfReviews",
        rating: "$productDetails.rating",
        totalSold: 1,
        totalRevenue: 1
      }
    }
  ]);
  
  

     // Fetch top 10 selling categories
     const topCategories = await Order.aggregate([
      { $unwind: "$products" },
      { $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $lookup: {
          from: "caregories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      { $group: {
          _id: "$categoryDetails._id",
          name: { $first: "$categoryDetails.name" },
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.totalPrice" },

        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    //notification
    const newOrder = await Order.find({ "products.status": { $in: ["pending"] }})
    .populate("userId")
    // .sort({ createdAt: -1 });
    
    // admin/adminDasbord/orders
    res.render("admin/adminDasbord/dashbord", {
      salesData,
      brandPerformance,
      categoryPerformance,
      selectedRange: range,
      topProducts,
      topBrands,
      topCategories,
      newOrder
    });
  } catch (error) {
    res.status(500).send('Error fetching dashboard data');
  }
};


exports.dashbord = async (req, res) => {
  try {
    const { range } = req.query;
    let startDate, endDate;

    switch (range) {
      case 'day':
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'week':
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
        break;
      case 'month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'year':
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        break;
      case 'custom':
        startDate = moment(req.query.startDate);
        endDate = moment(req.query.endDate);
        break;
      default:
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
    }

    // Fetch sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fetch brand performance data
    const brandPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalSales: { $sum: "$products.totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brandDetails"
        }
      },
      { $unwind: "$brandDetails" },
      {
        $project: {
          brandName: "$brandDetails.name",
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Fetch category performance data
    const categoryPerformance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          paymentStatus: 'success'
        }
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalSales: { $sum: "$products.totalPrice" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          categoryName: "$categoryDetails.name",
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({ salesData, brandPerformance, categoryPerformance });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching dashboard data' });
  }
};
