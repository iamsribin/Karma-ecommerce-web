const express = require("express");
const router = express.Router();
const upload = require("../../connetion/multerStorage")

const {
  renderLogin,
  logCheck,
} = require("../../controller/adminController/adminAuthController");
const {
  renderDashboard,
  renderProducts,
  renderAddproduct,
  renderBanner,
  renderCategory,
  renderCoupons,
  renderPayments,
  renderOrder,
  renderAddcoupens,
  addproduct,
} = require("../../controller/adminController/dashbordController");

const {deleteProduct} = require("../../controller/adminController/productController")
const { blockOrUnBlockUser, renderCostumers } = require("../../controller/adminController/customerController");
const {adminAuthCheck,checkAdmin} = require("../../middleware/adminMiddleware/authcheack")

//admin authentication
router.get("/login",checkAdmin,renderLogin);
router.post("/login", logCheck);
// router.get("/logout", logout);

//dashbord
router.get("/dashboard",adminAuthCheck, renderDashboard);

//coupen management
router.get("/add-coupen",renderAddcoupens);
router.get("/coupens",renderCoupons);

//paymens
router.get("/payments",renderPayments);
router.get("/orders",renderOrder);

//products
router.get("/products", renderProducts);
router.get("/add-product", renderAddproduct);
router.delete("/delete-product/:id", deleteProduct);
router.post('/add-product', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
]), addproduct);


//customers
router.get("/customers",renderCostumers);
router.patch("/block-unblock-user/:id", blockOrUnBlockUser);

module.exports = router;
