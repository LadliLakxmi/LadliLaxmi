const Razorpay = require("razorpay");

exports.razorpayinstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY,
	key_secret: process.env.RAZORPAY_SECRET,
});
