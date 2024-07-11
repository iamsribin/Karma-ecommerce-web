const express = require("express");
const router = express.Router();

const {profileUpload} = require("../../connetion/multerStorage")

//home controller
const {
  home,
  loginPage,
} = require("../../controller/userController/userController");

//auth controller
const {saveNewPassword,
  find,
  logout,
  postEmailForForgetOtp, 
  renderEmailForForgetOtp
} = require("../../controller/userController/authController");

//user porfile controller
const {
  getUserProfile,
  editUserInfo,
  createAddressess,
  getEditAddressDetailsWithId,
  editAddressDetails,
  deleteAddress,
  setNewPassword,
  getUserOrders,
} = require("../../controller/userController/userProfileController");

//otp controller
const {
  sendOTP,
  renderotpPage,
  verifyOtp,
  resendOtp,
  ForgotOtpPage,
  renderNewPasswordPage,
} = require("../../controller/userController/otpController");

//product controller
const {
  searchProduct,
  getProduct,
  renderCategoryPage,
  getProducts
} = require("../../controller/userController/productController");

//cart contoller
const {
  addCart,
  removeItemsFromCart,
  updateCartQuantity,
  renderCartPage,
} = require("../../controller/userController/cartController");

//order contoller
const {
  renderCheckoutPage,
  placeOrder,
  renderOrderConfirmationPage,
  renderOrderView,
  cancelOrder,
  returnProduct,
  generateOrderInvoice,
  createfailOrder
} = require("../../controller/userController/orderController");

//review controller
const {
  addReview,
  getProductReviews,
  createNewReview,
}= require("../../controller/userController/reviewController");

//middileware
const {
  isOTPVerificationProcess,
  userExit,
  isPasswordChangingProcess,
  isBlock,
  verifyUser,
} = require("../../middleware/userAuth");
//whishlist controller
const {
getWishlist,
addToWishlist,
deleteWishlist,
deleteOneProductFromWishlist
} = require("../../controller/userController/wishListController ");

//payment controller
const {
getKey,
verifyPayment,
createRazerPayOrder
} = require("../../controller/userController/paymentController");

const {
applyCoupon,
removeCoupon
} = require("../../controller/userController/couponcontroller")

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//login
router.post("/register", userExit, sendOTP);
router.post("/login", userExit, find);
router.get("/login", userExit, loginPage);
router.get("/logout", logout);
//otp
router.get("/resendOtp", isOTPVerificationProcess, resendOtp);
router.get("/resendOtpForForgotOtp", isPasswordChangingProcess, resendOtp);
router.get("/getotp", isOTPVerificationProcess, renderotpPage);
router.post("/verify-otp", isOTPVerificationProcess, verifyOtp);
//home
router.get("/",isBlock, home);
//password
router.get("/changePassword", isPasswordChangingProcess, renderNewPasswordPage);
router.post("/forgot-password-otp", ForgotOtpPage);
router.post( "/verify-forgot-password-otp", isPasswordChangingProcess, verifyOtp);
router.post("/save-new-password", isPasswordChangingProcess, saveNewPassword);
router.get("/getotp-forgot-password", isPasswordChangingProcess, postEmailForForgetOtp);
router.get("/sendmail", renderEmailForForgetOtp);
router.patch("/setNewPassword",isBlock,verifyUser,setNewPassword );
//product
router.get("/product/:id",isBlock, getProduct);
router.get("/category", isBlock, renderCategoryPage);
//user profile
router.get("/user-profile",verifyUser, isBlock, getUserProfile);
router.patch("/edit-user-personal-info/:id",verifyUser, profileUpload.single("image"), editUserInfo);
//address
router.post("/create-address",verifyUser, createAddressess);
router.get("/getEditAddress/:id",verifyUser, getEditAddressDetailsWithId);
router.patch("/editAddress/:id",verifyUser, editAddressDetails);
router.delete("/delete-address", verifyUser, deleteAddress);
// cart
router.get("/cart", verifyUser, renderCartPage);
router.post("/add-to-cart", verifyUser, addCart); 
router.put("/update-cart-quantity",verifyUser, updateCartQuantity);
router.delete("/delete-cart-item",verifyUser, removeItemsFromCart);
//order
router.get("/checkout", verifyUser, renderCheckoutPage);
router.post("/place-order", verifyUser, placeOrder);
router.get("/order-confirmation/:id",verifyUser, renderOrderConfirmationPage);
router.get('/orders',verifyUser, getUserOrders);
router.get("/order-view/:id/:orderId",verifyUser, renderOrderView);
router.post("/cancel-product",verifyUser, cancelOrder);
router.post("/return-product",verifyUser, returnProduct);
//review 
router.post("/submit-review", verifyUser, createNewReview);
//search and filrer
router.get("/filter",getProducts);
router.get("/search",searchProduct);
//paymets
router.get("/razor-key",getKey);
router.post("/razor-order", createRazerPayOrder);
router.post("/razor-verify", verifyPayment);
// router.post("/faildorder", createfailOrder);
//whishlist
router.get("/wishlist",verifyUser, getWishlist);
router.post("/add-wishlist", addToWishlist);
router.post("/delete-wishlist-item", deleteOneProductFromWishlist);
//dowload invoices
router.get("/dowload-invoice/:id",generateOrderInvoice);
//coupon
router.post("/apply-coupon",verifyUser, applyCoupon);

module.exports = router;
