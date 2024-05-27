const express = require("express");
const router = express.Router();
const upload = require("../../connetion/multerStorage");

//auth controller
const {
  renderLogin,
  logCheck,
  logOut,
} = require("../../controller/adminController/adminAuthController");

//dashboard controller
const {
  renderDashboard,
  renderBanner,
  renderCategory,
  renderPayments,
  renderOrder,
} = require("../../controller/adminController/dashbordController");

//coupon controller
const {
  addCoupon,
  renderAddCoupons,
  renderCoupons,
  deleteCoupon,
} = require("../../controller/adminController/couponController");

//product controller
const {
  renderAddproduct,
  renderProducts,
  deleteProduct,
  addproduct,
} = require("../../controller/adminController/productController");

//customer controller
const {
  blockOrUnBlockUser,
  renderCostumers,
} = require("../../controller/adminController/customerController");

//category and brand controller
const {
  renderCategoriesAndBrands,
  renderAddCategoryPage,
  AddNewCategory,
  deleteCategory,
  renderAddBrandPage,
  AddNewBrand,
  deleteBrand,
} = require("../../controller/adminController/category&brandController");

//middlewares
const { adminAuthCheck, checkAdmin } = require("../../middleware/adminAuth");

//admin authentication router
router.get("/login", checkAdmin, renderLogin);
router.post("/login", logCheck);
router.get("/logout", logOut);

//dashbord
router.get("/dashboard", adminAuthCheck, renderDashboard);

//coupen management
router.get("/add-coupen", renderAddCoupons);
router.get("/coupens", renderCoupons);
router.post("/add-coupon", addCoupon);
router.delete("/delete-coupon/:id", deleteCoupon);
//paymens
router.get("/payments", renderPayments);
router.get("/orders", renderOrder);
//products
router.get("/products", renderProducts);
router.get("/add-product", renderAddproduct);
router.delete("/delete-product/:id", deleteProduct);
router.post(
  "/add-product",
  upload.fields([
    { name: "productImage1", maxCount: 1 },
    { name: "productImage2", maxCount: 1 },
    { name: "productImage3", maxCount: 1 },
  ]),
  addproduct
);

//customers
router.get("/customers", renderCostumers);
router.patch("/block-unblock-user/:id", blockOrUnBlockUser);

//category
router.get("/categories-and-brand", renderCategoriesAndBrands);
router.get("/add-category-page", renderAddCategoryPage);
router.post("/add-category", AddNewCategory);
router.delete("/delete-category/:id", deleteCategory);
//brand
router.get("/add-brand-page", renderAddBrandPage);
router.post("/add-brand", AddNewBrand);
router.delete("/delete-brand/:id", deleteBrand);


module.exports = router;
