const express = require("express");
const router = express.Router();
const {upload} = require("../../connetion/multerStorage");

//auth controller
const {
  renderLogin,
  logCheck,
  logOut,
} = require("../../controller/adminController/adminAuthController");

//dashboard controller
const {
  renderDashboard,
  dashbord,
} = require("../../controller/adminController/dashbordController");
//orders controller
const {
listOrders,
renderViewOrder,
updateProductStatus,
} = require("../../controller/adminController/orderController")
//coupon controller
const {
  addCoupon,
  renderAddCoupons,
  renderCoupons,
  deleteCoupon,
  renderEditCouponPage,
  editCoupon,
  // getCoupons,
} = require("../../controller/adminController/couponController");

//product controller
const {
  renderAddproduct,
  renderDeletedProducts,
  renderProducts,
  deleteProduct,
  addProduct,
  editProduct,
  renderEditProductPage,
  adminAddProductCheck_get,
  deleteImage,
  recoverProduct,
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

//payment controller
const{
renderPaymentsList
} = require("../../controller/adminController/paymentController");

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

//return controller
const {
  renderReturnProducts,
  updateReturnStatus,
  returnProductView
} = require("../../controller/adminController/returnProductController")

// order export controller
const {
generateOrderExcel,
generateOrderCSV,
generateOrderPDF
} = require("../../controller/adminController/orderExportController");

const {
  renderManageOfferPage,
  updateReferralLink, 
  deleteReferral,
  renderManageOfferCategory,
  addNewCategoryOffer,
  updateCategoryOffer,
  deleteCategoryOffer
}= require("../../controller/adminController/offerController");

//middlewares
const { checkAdmin, verifyAdmin } = require("../../middleware/adminAuth");

//admin authentication router
router.get("/login", checkAdmin, renderLogin);
router.post("/login", logCheck);
router.get("/logout", logOut);
//dashbord
router.get("/dashboard", verifyAdmin, renderDashboard);
//coupen management
router.get("/add-coupen",verifyAdmin, renderAddCoupons);
router.get("/coupens",verifyAdmin, renderCoupons);
router.post("/add-coupon", verifyAdmin, addCoupon);
router.delete("/delete-coupon/:id",verifyAdmin, deleteCoupon);
router.get("/edit-coupon-page/:id",verifyAdmin, renderEditCouponPage);
router.patch("/edit-coupon/:id", verifyAdmin,editCoupon);
//orders
router.get("/orders", verifyAdmin, listOrders);
router.get("/view-order/:id",verifyAdmin, renderViewOrder);
router.post('/update-order-status', updateProductStatus);
//products
router.get("/products", verifyAdmin, renderProducts);
router.get("/deleted-productList", verifyAdmin, renderDeletedProducts);
router.get("/add-product", verifyAdmin, renderAddproduct);
router.delete("/delete-product/:id", verifyAdmin, deleteProduct);
router.patch("/recover-product/:id", verifyAdmin, recoverProduct);
router.get("/edit-product/:id",verifyAdmin, renderEditProductPage);
router.post("/add-product", verifyAdmin, upload.array('images'),   addProduct);
router.post("/edit-product/:id", verifyAdmin, upload.array('images'),  editProduct);
router.patch("/deleteImage",verifyAdmin, deleteImage);
router.post('/admin-add-product-check',verifyAdmin, adminAddProductCheck_get);
//customers
router.get("/customers",verifyAdmin, renderCostumers);
router.patch("/block-unblock-user/:id",verifyAdmin,  blockOrUnBlockUser);
//category
router.get("/categories-and-brand", verifyAdmin, renderCategoriesAndBrands);
router.get("/add-category-page", verifyAdmin, renderAddCategoryPage);
router.post("/add-category", verifyAdmin, AddNewCategory);
router.delete("/delete-category/:id",verifyAdmin, deleteCategory);
router.get("/edit-category-page/:id",verifyAdmin, renderEditCategoryPage);
router.patch("/edit-category/:id", verifyAdmin, editCategory);
//brand
router.get("/add-brand-page", verifyAdmin, renderAddBrandPage);
router.post("/add-brand", verifyAdmin, AddNewBrand);
router.delete("/delete-brand/:id", verifyAdmin, deleteBrand);
router.get("/edit-brand-page/:id", verifyAdmin, renderEditBrandPage);
router.patch("/edit-brand/:id", verifyAdmin, editBrand);
//tags
router.get("/tags-and-size", verifyAdmin, renderTagAndSize);
router.get("/add-tag-page", verifyAdmin, renderAddTagPage);
router.post("/add-tag", verifyAdmin, AddNewTag);
router.delete("/delete-tag/:id", verifyAdmin,  deleteTag);
router.get("/edit-tag-page/:id", verifyAdmin, renderEditTagPage);
router.patch("/edit-tag/:id", verifyAdmin, editTag);
//size
router.get("/add-size-page", verifyAdmin, renderAddSizePage);
router.post("/add-size", verifyAdmin, AddNewSize);
router.delete("/delete-size/:id", verifyAdmin, deleteSize);
router.get("/edit-size-page/:id", verifyAdmin, renderEditSizePage);
router.patch("/edit-size/:id", verifyAdmin, editSize);
//return products
router.get("/retrun-products", verifyAdmin, renderReturnProducts);
router.post("/update-return-order-status",verifyAdmin, updateReturnStatus);
router.get("/retuenProduct-ditails/:orderId/:productId", verifyAdmin, returnProductView);
//payments
router.get("/payments", verifyAdmin, renderPaymentsList);
//order downloads
router.post("/order-generate-excel",verifyAdmin, generateOrderExcel);
router.post("/order-generate-csv",verifyAdmin, generateOrderCSV);
router.post("/order-generate-pdf", verifyAdmin, generateOrderPDF);
router.get("/sales-report", dashbord);
//offer
router.get("/manage-offer", verifyAdmin, renderManageOfferPage);
router.post("/update-referral-reward",verifyAdmin ,updateReferralLink);
router.delete("/delete-referral-offer", verifyAdmin, deleteReferral);
router.get("/offer-category", verifyAdmin, renderManageOfferCategory);
router.post("/add-new-category-offer", verifyAdmin, addNewCategoryOffer);
router.put("/update-category-offer", verifyAdmin, updateCategoryOffer);
router.delete("/delete-category-offer/:id", verifyAdmin, deleteCategoryOffer);

module.exports = router;
