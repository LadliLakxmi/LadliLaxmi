const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateOtp, sendOtpEmail } = require('../utils/mailSender');

exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body; // email or phone
  if (!identifier) {
    return res.status(400).json({ success: false, message: "Identifier is required." });
  }

  try {
    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ phone: identifier });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.email) return res.status(400).json({ success: false, message: "No email registered for reset." });

    const plainOtp = generateOtp();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    const otpExpires = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000);

    user.otp = hashedOtp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(user.email, plainOtp);

    res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


exports.resetPassword = async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier.toLowerCase() }).select('+otp +otpExpires +password')
      : await User.findOne({ phone: identifier }).select('+otp +otpExpires +password');

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.otp || !user.otpExpires) return res.status(400).json({ success: false, message: "No OTP found or expired." });
    if (user.otpExpires < new Date()) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    const validOtp = await bcrypt.compare(otp, user.otp);
    if (!validOtp) return res.status(401).json({ success: false, message: "Invalid OTP." });

    user.otp = undefined;
    user.otpExpires = undefined;

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
