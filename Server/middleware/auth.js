// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
const auth = async (req, res, next) => {
  try {
    // Extracting JWT from request cookies, body or header
   const token =
  req.cookies?.token ||
  req.body?.token ||
  req.header("Authorization")?.replace("Bearer ", "");
    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }

    try {
      // Verifying the JWT using the secret key stored in environment variables
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      // Storing the decoded JWT payload in the request object for further use
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      console.error("Token verification error:", error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired. Please log in again.", expired: true });
      } else {
        return res.status(401).json({ message: "Not authorized, token failed.", invalidToken: true });
      }
    }

    // If JWT is valid, move on to the next middleware or request handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
    });
  }
};

const isAdmin = async (req, res, next) => {
  const { userId } = req.user.id;
  const user = await User.findById(userId);
  const token =
  req.cookies?.token ||
  req.body?.token ||
  req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }
    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      if(decode && decode.role === "Admin"){
        next();
      } else {
    return res.status(403).json({ message: "Admin access only" });
  }
    } catch (error) {
      return res.status(403).json({ message: "token for Admin access only is not present" });
    }

};


module.exports = { auth , isAdmin };
