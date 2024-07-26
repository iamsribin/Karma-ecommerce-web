const generateOTP = require("../../utils/generateOTP");
const sendEmail = require("../../utils/email");
const bcrypt = require("bcrypt");
const User = require("../../models/userModels/userModel");
const { createError } = require("../../utils/errors");
const Referral = require("../../models/adminModels/referral");
const mongoose = require("mongoose");
const Wallet = require("../../models/userModels/walletModel");
const Counter = require("../../models/userModels/counterModel");

const { AUTH_EMAIL } = process.env;
const MAX_OTP_COUNT = 4;
let CurrentCount = 0;
let flag = false;


async function maxOtpExceeded() {
  try {

    const userWithOtp = await User.findOne({ otp: { $exists: true } });
    if (userWithOtp) {
      await User.deleteOne({ _id: userWithOtp._id });
      return true; 
    }
    return false;
  } catch (error) {
    throw error; 
  }
}

async function deleteOtp(email) {
  try {
    CurrentCount++;
    if (CurrentCount === MAX_OTP_COUNT) {
      const userDeleted = await maxOtpExceeded();
      if (userDeleted) {
        CurrentCount = 0;
        flag = true;
      }
    }
    setTimeout(async () => {
      await User.findOneAndUpdate({ email: email }, { $unset: { otp: "" } });
    }, 60000);
  } catch (error) {
    console.error("Error in deleteOtp:", error);
  }
}

async function giveReward(userId){
  try {

   const rewardUser = await User.findById(userId);
   const referral = await Referral.find({});

   if(!rewardUser || referral.length === 0){
    return null;
   }
   
   let counter = await Counter.findOne({
    model: "Wallet",
    field: "transaction_id",
  });

  // Checking if order counter already exist
  if (counter) {
    counter.count += 1;
    await counter.save();
  } else { 
    counter = await Counter.create({
      model: "Wallet",
      field: "transaction_id",
    });
  }

  let wallet = {};
  const exists = await Wallet.findOne({ user: userId });

  if (exists) {
    wallet = await Wallet.findByIdAndUpdate(exists._id, {
      $inc: {
        balance: referral[0].reward,
      },
      $push: {
        transactions: {
          transaction_id: counter.count + 1,
          amount: referral[0].reward,
          type: "credit",
          description: "referral link reward",
        },
      },
    });
  } else {
    wallet = await Wallet.create({
      user: userId,
      balance: referral[0].reward,
      transactions: [
        {
          transaction_id: counter.count + 1,
          amount: referral[0].reward,
          type: "credit",
          description: "referral link reward",
        },
      ],
    });
  }
  await Referral.findOneAndUpdate({}, { $inc: { userCount: 1 } }, { new: true });

  } catch (error) {
    res.status(500).json({message: "somthing went wrong"});  
  }
}


const sendOTP = async (req, res, next) => {
  const { name, email, password1, userId } = req.body;

  if (mongoose.Types.ObjectId.isValid(userId)) {
    req.session.referralUser = userId;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(401, `Email '${email}' is already registered`));
    }


    const generatedOTP = await generateOTP();
    console.log("generated otp:", generatedOTP);

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `
        <p>Hello new user, use this OTP to verify your email and continue:</p>
        <p style="color:tomato;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p>
        <p>OTP will expire in <b>1 minute</b>.</p>
      `,
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

    if (flag) {
      req.session.userGmail = null;
      req.session.user = null;
      req.session.userId = null;
      delete req.session.otpverfication;

      flag = false;
    } else {
      req.session.otpverfication = true;
      req.session.userGmail = email;
      req.session.userId = newUser._id;
    }

    await deleteOtp(email);

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
        res.status(500).json({message: "somthing went wrong"});  
      }   
    }, 5 * 60 * 1000);

    return res.status(200).json({ name: name });
  } catch (err) {
    next(createError(500, "Server error while sending OTP"));
  }
};

const renderotpPage = async (req, res, next) => {
  const email = req.session.userGmail;
  return res.render("user/registration/getOtp", { email: email });
};

const verifyOtp = async (req, res, next) => {
  const otp = req.body.otp;
  const email = req.session.userGmail;

  try {
    const user = await User.findOne({ email });

    if (!user) return next(createError(401, "Invalid email"));

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return next(createError(401, "Invalid OTP"));
     CurrentCount =0;

   const referralLink = `https://www.karmashop.world/login?userId=${user._id}`;

    await User.findOneAndUpdate({ email: user.email },
       { $unset: { otp: "" }, 
       referralLink: referralLink
      });

      const referralUser =  req?.session?.referralUser;

      if (mongoose.Types.ObjectId.isValid(referralUser)) {
        giveReward(referralUser);
      }
     

    if (!req.session.passwordChange) {
      req.session.userGmail = user.email;
      req.session.user = user.name;
      req.session.userId = user._id;
      delete req.session.otpverfication;
      delete  req.session.referralUser;
    }
    return res.status(200).json({ name: user.name });
  } catch (error) {
    return next(createError(500, "Server error while verifying OTP"));
  }
};

const resendOtp = async (req, res) => {
  try {
    const generatedOTP = await generateOTP();
    console.log("re generated otp:", generatedOTP);
    const email = req.session.userGmail;

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `
        <p>Hello user, use this OTP to verify your email and continue:</p>
        <p style="color:tomato;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p>
      `,
    };

    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(generatedOTP, salt);

    await User.findOneAndUpdate({ email: email }, { otp: hashedOTP });

    await sendEmail(mailOptions);
    deleteOtp(email);
    return res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};

//forgot otp

const ForgotOtpPage = async (req, res, next) => {
  const email = req.body.email;

  try {
    const existUser = await User.findOne({ email });
    const googleUser = await User.findOne({ googleId: { $exists: true } });

    if (!existUser) {
      return next(createError(401, "This email does not exist in the database"));
    } else if (googleUser) {
      return next(createError(401, "Password changes are not allowed for Google sign-ins."));
    }

    const generatedOTP = await generateOTP();
    console.log("generatedOTP forgot otp:", generatedOTP);

    const mailOptions = {
      from: AUTH_EMAIL,
      to: email,
      subject: "Verify the email using this OTP",
      html: `
        <p>Hello user, use this OTP to verify your email and continue:</p>
        <p style="color:tomato;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p>
        <p>OTP will expire in <b>1 minute</b>.</p>
      `,
    };

    await sendEmail(mailOptions);

    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(generatedOTP, salt);
    await User.findOneAndUpdate({ email: email }, { otp: hashedOTP });

    deleteOtp(email);

    req.session.userGmail = email;
    req.session.userId = existUser._id;
    req.session.passwordChange = true;
    
    return res.redirect("/getotp-forgot-password");
  } catch (error) {
    return next(createError(500, "Server error while handling forgot password OTP"));
  }
};

const renderNewPasswordPage = async (req, res) => {
  res.render("user/registration/forgotPassword");
  }
module.exports = {
  sendOTP,
  renderotpPage,
  verifyOtp,
  resendOtp,
  ForgotOtpPage,
  renderNewPasswordPage,
};