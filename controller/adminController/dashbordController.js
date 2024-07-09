
const { createError } = require("../../utils/errors");

//render dashboard page
exports.renderDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: "$discount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = dailySalesData.reduce((acc, curr) => {
      acc.totalSales += curr.totalSales;
      acc.totalOrders += curr.totalOrders;
      acc.totalDiscount += curr.totalDiscount;
      return acc;
    }, { totalSales: 0, totalOrders: 0, totalDiscount: 0 });

    const chartData = {
      labels: dailySalesData.map(item => item._id),
      sales: dailySalesData.map(item => item.totalSales)
    };

    res.render("admin/adminDasbord/dashbord", { initialSalesData: { summary, chartData } });
  } catch (error) {
    console.error('Error fetching daily sales data:', error);
    res.render("admin/adminDasbord/dashbord", { error: 'Failed to fetch daily sales data' });
  }
};

// render category page
exports.renderCategory = async (req, res) => {
  res.render("admin/adminDasbord/addproduct");
};

// render order page
exports.renderOrder = async (req, res) => {
  res.render("admin/adminDasbord/orders");
};

// render banner page
exports.renderBanner = async (req, res) => {
  res.render("admin/adminDasbord/addproduct");
};

// render payments page
exports.renderPayments = async (req, res) => {
  res.render("admin/adminDasbord/payments");
};

const Order = require('../../models/userModels/orderModel');

exports.dashbord = async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.query;
    let query = {};
    let groupBy = {};

    const now = new Date();
    now.setHours(23, 59, 59, 999);

    switch (filterType) {
        case 'daily':
            query.createdAt = { 
                $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
                $lte: now
            };
            groupBy = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
            break;
        case 'weekly':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            query.createdAt = { $gte: weekAgo, $lte: now };
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            break;
        case 'monthly':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query.createdAt = { $gte: monthAgo, $lte: now };
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            break;
        case 'yearly':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            query.createdAt = { $gte: yearAgo, $lte: now };
            groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
            break;
        case 'custom':
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            break;
    }

    const result = await Order.aggregate([
        { $match: query },
        {
            $group: {
                _id: groupBy,
                totalSales: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 },
                totalDiscount: { $sum: "$discount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const summary = result.reduce((acc, curr) => {
        acc.totalSales += curr.totalSales;
        acc.totalOrders += curr.totalOrders;
        acc.totalDiscount += curr.totalDiscount;
        return acc;
    }, { totalSales: 0, totalOrders: 0, totalDiscount: 0 });

    const chartData = {
        labels: result.map(item => item._id),
        sales: result.map(item => item.totalSales)
    };

    res.json({ summary, chartData });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the sales report' });
}
};
