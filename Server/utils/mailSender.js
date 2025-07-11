const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      secure: false,
    })

    let info = await transporter.sendMail({
      from: `"Ladli Lakshmi" <${process.env.MAIL_USER}>`, // sender address
      to: `${email}`, // list of receivers
      subject: `${title}`, // Subject line
      html: `${body}`, // html body
    })
    return info
  } catch (error) {
    console.log(error.message)
    return error.message
  }
}

// sendOtpEmail now uses the mailSender function
const sendOtpEmail = async (email, otp) => {
  console.log(`Attempting to send OTP ${otp} to ${email} via Email`);
  const title = 'Your Login OTP for Admin Access';
  const body = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">Admin Login OTP</h2>
      <p>Dear Admin,</p>
      <p>Your One-Time Password (OTP) for logging in is:</p>
      <h1 style="color: #d32f2f; font-size: 2em; margin: 20px 0; background-color: #f2f2f2; padding: 10px; border-radius: 5px;">${otp}</h1>
      <p>This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
      <p>Please do not share this OTP with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>Your Application Team</p>
    </div>
  `;

  try {
    await mailSender(email, title, body); // Call the centralized mailSender function
    console.log('OTP Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP Email to', email, ':', error);
    // You might want to throw an error here to prevent login if email sending fails
    throw new Error('Failed to send OTP Email. Please check server logs.');
  }
};

const generateOtp = () => {
  // Generate a 6-digit numeric OTP for email
  // crypto.randomBytes(3).toString('hex').slice(0, 6);
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  mailSender,
  generateOtp,
  sendOtpEmail, // Export only sendOtpEmail
};


// module.exports = mailSender
