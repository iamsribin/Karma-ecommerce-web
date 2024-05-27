const express = require("express");
const router = express.Router();

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
//otp controller
const {
  sendOTP,
  renderotpPage,
  verifyOtp,
  resendOtp,
  ForgotOtpPage,
  renderNewPasswordPage,
} = require("../../controller/userController/otpController");
//middileware
const {
  isOTPVerificationProcess,
  userExit,
  isPasswordChangingProcess,
} = require("../../middleware/userAuth");
//product controller
const {
  getProduct,
  renderCategoryPage,
} = require("../../controller/userController/productController");

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
router.get("/", home);
//forgot password
router.get("/chagePassword", isPasswordChangingProcess, renderNewPasswordPage);
router.post("/forgot-password-otp", ForgotOtpPage);
router.post( "/verify-forgot-password-otp", isPasswordChangingProcess, verifyOtp);
router.post("/save-new-password", isPasswordChangingProcess, saveNewPassword);
router.get("/getotp-forgot-password", isPasswordChangingProcess, postEmailForForgetOtp);
router.get("/sendmail", renderEmailForForgetOtp);
//product
router.get("/product/:id", getProduct);
router.get("/category", renderCategoryPage);

module.exports = router;
