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
  renderEditCouponPage,
  editCoupon,
} = require("../../controller/adminController/couponController");

//product controller
const {
  renderAddproduct,
  renderProducts,
  deleteProduct,
  addProduct,
  editProduct,
  renderEditProductPage,
} = require("../../controller/adminController/productController");

//customer controller
const {
  blockOrUnBlockUser,
  renderCostumers,
} = require("../../controller/adminController/customerController");

//category and brand controller
const {
  //category
  renderCategoriesAndBrands,
  renderAddCategoryPage,
  renderEditCategoryPage,
  editCategory,
  AddNewCategory,
  deleteCategory,
  //brand
  renderAddBrandPage,
  AddNewBrand,
  renderEditBrandPage,
  editBrand,
  deleteBrand,
} = require("../../controller/adminController/category&brandController");

//tag and size controller
const {
  //tag
  renderTagAndSize,
  renderAddTagPage,
  renderEditTagPage,
  editTag,
  AddNewTag,
  deleteTag,
  //brand
  renderAddSizePage,
  AddNewSize,
  renderEditSizePage,
  editSize,
  deleteSize,
} = require("../../controller/adminController/tag&sizeController");


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
router.get("/edit-coupon-page/:id", renderEditCouponPage);
router.patch("/edit-coupon/:id", editCoupon);
//paymens
router.get("/payments", renderPayments);
router.get("/orders", renderOrder);
//products
router.get("/products", renderProducts);
router.get("/add-product", renderAddproduct);
router.delete("/delete-product/:id", deleteProduct);
router.get("/edit-product/:id", renderEditProductPage);
router.post("/add-product", upload.array('images', 4),   addProduct);
router.patch("/edit-product/:id",  upload.fields([
  { name: "productImage1", maxCount: 1 },
  { name: "productImage2", maxCount: 1 },
  { name: "productImage3", maxCount: 1 },
]), editProduct);
//customers
router.get("/customers", renderCostumers);
router.patch("/block-unblock-user/:id", blockOrUnBlockUser);
//category
router.get("/categories-and-brand", renderCategoriesAndBrands);
router.get("/add-category-page", renderAddCategoryPage);
router.post("/add-category", AddNewCategory);
router.delete("/delete-category/:id", deleteCategory);
router.get("/edit-category-page/:id",renderEditCategoryPage);
router.patch("/edit-category/:id", editCategory);
//brand
router.get("/add-brand-page", renderAddBrandPage);
router.post("/add-brand", AddNewBrand);
router.delete("/delete-brand/:id", deleteBrand);
router.get("/edit-brand-page/:id", renderEditBrandPage);
router.patch("/edit-brand/:id", editBrand);
//tags
router.get("/tags-and-size", renderTagAndSize);
router.get("/add-tag-page", renderAddTagPage);
router.post("/add-tag", AddNewTag);
router.delete("/delete-tag/:id", deleteTag);
router.get("/edit-tag-page/:id",renderEditTagPage);
router.patch("/edit-tag/:id", editTag);
//size
router.get("/add-size-page", renderAddSizePage);
router.post("/add-size", AddNewSize);
router.delete("/delete-size/:id", deleteSize);
router.get("/edit-size-page/:id", renderEditSizePage);
router.patch("/edit-size/:id", editSize);


module.exports = router;
