const generateOTP = require("../../utils/generateOTP");
const sendEmail = require("../../utils/email");
const bcrypt = require("bcrypt");
const User = require("../../models/userModels/userModel");
const { createError } = require("../../utils/errors");
const { AUTH_EMAIL } = process.env;

//sent otp and storing user data
const sendOTP = async (req, res, next) => {
  const { name, email, password1 } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return next(createError(401, `Email '${email}' is already registered`));

    const generatedOTP = await generateOTP();
    console.log("genarated otp:", generatedOTP);

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `<p>Hello new user, use this OTP to verify your email and continue:</p>
             <p style="color:tomato;font-size:25px;letter-spacing:2px;">
             <b>${generatedOTP}</b></p>
             <p>OTP will expire in <b>3 minute(s)</b>.</p>`,
    };

    await sendEmail(mailOptions);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password1, salt);
    const hashedOTP = await bcrypt.hash(generatedOTP, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp: hashedOTP,
    });

    await newUser.save();

    req.session.otpverfication = true;
    req.session.userGmail = email;
    req.session.userId = newUser._id;

    //deleting the document if didn't enter the otp
    setTimeout(async () => {
      try {

        const OTP = await User.findOne({ otp: { $exists: true } });

        if (OTP) {
          await User.deleteOne({ otp: { $exists: true } });
          req.session.userGmail = null;
          req.session.user = null;
          req.session.userId = null;
          delete req.session.otpverfication;
        }

      } catch (error) {
        console.error("Error deleting user document:", error);
      }   
    }, 3 * 60 * 1000);

    return res.status(200).json({ name: name });
  } catch (err) {

    next(createError(null, null));
  }
};

//render otp
const renderotpPage = async (req, res, next) => {
  const email = req.session.userGmail;
  return res.render("user/registration/getOtp", { email: email });
};

//verify user
const verifyOtp = async (req, res, next) => {
  console.log("entered verifyOtp");

  const otp = req.body.otp;
  const email = req.session.userGmail;

  try {
    const user = await User.findOne({ email });
    if (!user) return next(createError(401, "Invalid email"));

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return next(createError(401, "Invalid OTP"));

    await User.findOneAndUpdate({ email: user.email }, { $unset: { otp: "" } });

    if (!req.session.passwordChange) {
      
      req.session.userGmail = user.email;
      req.session.user = user.name;
      req.session.userId = user._id;

      delete req.session.otpverfication;

    }
    return res.status(200).json({ name: user.name });
  } catch (error) {

    return next(createError(null, null));
  }
};

//resend otp
const resendOtp = async (req, res) => {
  try {

    const generatedOTP = await generateOTP();
    console.log("re genarated otp:", generatedOTP);
    const email = req.session.userGmail;

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `<p>Hello new user, use this OTP to verify your email and continue:</p>
              <p style="color:tomato;font-size:25px;letter-spacing:2px;">
              <b>${generatedOTP}</b></p>`,
    };

    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(generatedOTP, salt);

    await User.findOneAndUpdate({ email: email }, { otp: hashedOTP });

    await sendEmail(mailOptions);

    return;
  } catch (err) {

    res.status(null).json(null);
  }
};

//forgot password otp
const ForgotOtpPage = async (req, res, next) => {
  const email = req.body.email;

  const existUser = await User.findOne({ email });
  const googleUser = await User.findOne({ googleId: { $exists: true } });

  if (!existUser) {
    return next(createError(401, "this email not exist in the database"));

  } else if (googleUser) {
    return next(
      createError(
        401,
        "Oops! It seems you've signed in with Google. Please note that password changes are not allowed for Google sign-ins."
      )
    );
  }

  const generatedOTP = await generateOTP();

  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Verify the email using this OTP",
    html: `<p>Hello new user, use this OTP to verify your email and continue:</p>
           <p style="color:tomato;font-size:25px;letter-spacing:2px;">
           <b>${generatedOTP}</b></p>
           <p>OTP will expire in <b>3 minute(s)</b>.</p>`,
  };

  await sendEmail(mailOptions);

  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(generatedOTP, salt);
  await User.findOneAndUpdate({ email: email }, { otp: hashedOTP });

  setTimeout(async () => {
    try {
      const OTP = await User.findOne({ otp: { $exists: true } });

      if (OTP) {
        await User.findOneAndUpdate({ email: email }, { $unset: { otp: "" } });
        req.session.userGmail = null;
        req.session.userId = null;
        delete req.session.otpverfication;

      } 
    } catch (error) {
      console.error("Error deleting user document:", error);
    }
  }, 3 * 60 * 1000);

  req.session.userGmail = email;
  req.session.userId = existUser._id;
  req.session.passwordChange = true;
  
  return res.redirect("/getotp-forgot-password");
};

const renderNewPasswordPage = async (req, res) => {
  res.render("user/registration/forgotPassword");
};

module.exports = {
  sendOTP,
  renderotpPage,
  verifyOtp,
  resendOtp,
  ForgotOtpPage,
  renderNewPasswordPage,
};
