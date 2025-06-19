// utils/axiosConfig.js
import axios from "axios";

const setupInterceptors = (navigate) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if the error is due to an unauthorized (401) response
      if (error.response && error.response.status === 401) {
        // Check for specific messages indicating token expiry or invalidity
        if (
          error.response.data.message === "Token expired. Please log in again." ||
          error.response.data.message === "Not authorized, token failed." ||
          error.response.data.message === "Not authorized, no token."
        ) {
          console.log("Token expired or invalid. Logging out...");
          // Clear local storage
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("user");

          // Redirect to login page
          // Use the navigate function passed from react-router-dom
          if (navigate) {
            navigate("/account"); // Your login route
          } else {
            window.location.href = "/account"; // Fallback if navigate is not passed
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
