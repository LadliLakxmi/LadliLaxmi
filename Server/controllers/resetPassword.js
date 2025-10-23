import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import nodemailer from "nodemailer";


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate secure token
    const token = crypto.randomBytes(20).toString("hex");

    // Store token and expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 465,
      secure: process.env.MAIL_SECURE === "true" || true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetUrl = `https://www.ladlilakshmi.com/reset-password/${token}`;

    const mailOptions = {
      from: process.env.MAIL_USER, // better to have from same as auth user
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetUrl}">${resetUrl}</a> to reset your password.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    };

    // Send mail with error handling
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending reset email:", err);
        return res.status(500).json({ message: "Failed to send email" });
      }
      return res.status(200).json({ success: true, message: "Password reset email sent" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
