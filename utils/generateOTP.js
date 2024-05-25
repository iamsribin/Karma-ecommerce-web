const generateOTP = async () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("User OTP:", otp);
    return otp.toString();
};
 
module.exports = generateOTP;
