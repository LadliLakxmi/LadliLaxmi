const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL } = process.env;

exports.connect = () => {
    mongoose
        .connect(MONGODB_URL) // Removed the deprecated options
        .then(() => console.log(`DB Connection Success`)) // Using an arrow function for clarity
        .catch((err) => {
            console.log(`DB Connection Failed`);
            console.log(err);
            process.exit(1); // Exit the process if the database connection fails
        });
};