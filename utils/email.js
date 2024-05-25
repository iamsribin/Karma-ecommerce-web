const nodemailer = require("nodemailer");
require('dotenv').config();
const { AUTH_EMAIL, AUTH_PASS } = process.env;

let mailTransporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: AUTH_EMAIL,  
        pass: AUTH_PASS,
    },
    tls: {
        rejectUnauthorized: false, 
    },
});

mailTransporter.verify((error, success) => {
    if (error) {
        console.log("Error verifying transporter:", error);
    } else {
        console.log("Transporter is ready to send emails");
        console.log(success); 
    }
});

const sendEmail = async (mailOptions) => {
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (err) {
        console.log("Error sending email:", err);
    }
};

module.exports = sendEmail;
