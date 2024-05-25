const express = require("express");
const router = express.Router();

const {
  renderCategoryPage,
  home,
  loginPage,
} = require("../../controller/userController/userController");

const authController = require("../../controller/userController/authController");

const {
  sendOTP,
  renderotpPage,
  verifyOtp,
  resendOtp,
  ForgotOtpPage,
  renderNewPasswordPage,
} = require("../../controller/userController/otpController");

const {
  checkLogin,
  checkOTPVerification,
  logout,
} = require("../../middleware/userMiddleware/chekLogin");

const {getProduct} = require("../../controller/userController/productController")



router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//login
router.post("/register", checkLogin, sendOTP);
router.post("/login", authController.find);
router.get("/login", loginPage);
router.get("/getotp", renderotpPage);
router.get("/logout", logout);
//otp
router.get("/resendOtp", resendOtp);
router.post("/verify-otp", verifyOtp);
//home
router.get("/", home);
//forgot password
router.post("/forgot-password-otp", ForgotOtpPage);
router.post("/verify-forgot-password-otp", verifyOtp);
router.post("/save-new-password", authController.saveNewPassword);
router.get("/getotp-forgot-password", authController.postEmailForForgetOtp);
router.get("/sendmail", authController.renderEmailForForgetOtp);
router.get("/chagePassword", renderNewPasswordPage);

//product
router.get("/product/:id",getProduct);
router.get("/category", renderCategoryPage);

module.exports = router;
