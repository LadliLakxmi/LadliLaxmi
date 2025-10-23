// Importing necessary modules and packages
const express = require("express");
const app = express();
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const helmet = require('helmet'); // Import helmet
const cors = require('cors'); // For cross-origin requests

dotenv.config(); // Load environment variables
// Setting up port number
const PORT = process.env.PORT || 4000;
// Connecting to database
database.connect();
app.use(helmet());

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://www.ladlilakshmi.com", // Update with your frontend URL for production
    credentials: true,
  })
);


// Testing the server
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  });
});

const registrationRoutes = require("./routes/registrationRoutes")
const upgradeRoutes = require('./routes/upgrade');
const adminRoutes = require('./routes/adminRoutes');
const donationRoutes = require('./routes/donationRoutes');
const profileRoute = require('./routes/ProfileRoute');
const withdrawRoutes= require('./routes/withdrawRoutes')
// Import routes
const walletTransactionRoutes = require('./routes/walletTransactionRoutes');
const UplineRoutes = require('./routes/UplineRoutes');
const transactionroute =require('./routes/TransactionDetRoute')
const DownlineStatusRoutes =require('./routes/DownlineStatusRoutes')

// Mount routes
app.use('/api/v1/wallet-transactions', walletTransactionRoutes);
app.use("/api/v1/auth", registrationRoutes);
app.use("/api/v1/withdraw", withdrawRoutes);

app.use('/api/v1', transactionroute);
app.use('/api/v1/upgrade', upgradeRoutes);
app.use('/api/v1/upline', UplineRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/admin",adminRoutes );
app.use("/api/v1/user",DownlineStatusRoutes );

// Admin routes



app.get("/test", (req, res) => {
  return res.json({
    success: true,
    message: "Test route is working",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// Listening to the server
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});





