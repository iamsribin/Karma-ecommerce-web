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
  getProduct,
  renderCategoryPage,
} = require("../../controller/userController/productController");

//cart contoller
const {
  addCart,
  removeItemsFromCart,
  updateCartQuantity,
  renderCartPage,
} = require("../../controller/userController/cartController");

//checkout contoller
const {
  renderCheckoutPage,
  placeOrder
} = require("../../controller/userController/checkoutController");

//middileware
const {
  isOTPVerificationProcess,
  userExit,
  isPasswordChangingProcess,
  isBlock,
  verifyUser,
} = require("../../middleware/userAuth");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//login
router.post("/register", userExit, sendOTP);
router.post("/login", userExit, find);
router.get("/login", userExit, loginPage);
router.get("/logout", logout);
//otp
router.get("/resendOtp", isOTPVerificationProcess, resendOtp);
router.get("/getotp", isOTPVerificationProcess, renderotpPage);
router.post("/verify-otp", isOTPVerificationProcess, verifyOtp);
//home
router.get("/",isBlock, home);
//forgot password
router.get("/chagePassword", isPasswordChangingProcess, renderNewPasswordPage);
router.post("/forgot-password-otp", ForgotOtpPage);
router.post( "/verify-forgot-password-otp", isPasswordChangingProcess, verifyOtp);
router.post("/save-new-password", isPasswordChangingProcess, saveNewPassword);
router.get("/getotp-forgot-password", isPasswordChangingProcess, postEmailForForgetOtp);
router.get("/sendmail", renderEmailForForgetOtp);
//product
router.get("/product/:id",isBlock, getProduct);
router.get("/category", isBlock, renderCategoryPage);
//user profile
router.get("/user-profile",verifyUser, isBlock, getUserProfile);
router.patch("/edit-user-personal-info/:id",verifyUser, profileUpload.single("image"), editUserInfo);
//address
router.post("/create-address", createAddressess);
router.get("/getEditAddress/:id", getEditAddressDetailsWithId);
router.patch("/editAddress/:id", editAddressDetails);
router.delete("/delete-address", deleteAddress);
// cart
router.get("/cart", verifyUser, renderCartPage);
router.post("/add-to-cart", verifyUser, addCart); 
router.put("/update-cart-quantity", updateCartQuantity);
router.delete("/delete-cart-item", removeItemsFromCart);
//checkout
router.get("/checkout", verifyUser, renderCheckoutPage);
router.post("/place-order", verifyUser, placeOrder);
module.exports = router;
