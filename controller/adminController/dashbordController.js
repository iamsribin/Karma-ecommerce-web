
const { createError } = require("../../utils/errors");

//render dashboard page
exports.renderDashboard = async (req, res) => {
  res.render("admin/adminDasbord/dashbord");
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


//add product
