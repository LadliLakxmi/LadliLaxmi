import axios from "axios";
import React, { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext"; // Uncomment if you have an AuthContext
import { useNavigate } from "react-router-dom";

const Login = () => {
  // State for form data, password visibility, error messages, and loading status
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // const { login } = useAuth(); // Uncomment if you have an AuthContext
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      // Call the backend login API
      const response = await axios.post(
        "http://localhost:4001/api/v1/auth/login", // Changed to match common user login endpoint
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        // Login successful
        const { token, user } = response.data;

        // Store token and user details in local storage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("user", JSON.stringify(user));

        // navigate("/account"); // Navigate to the home page or dashboard
        user.role==="Admin"?navigate("/Admindashboard/dashboard"):navigate("/userdashboard"); // Navigate to the home page or dashboard
      } else {
        // Login failed
        setError(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login ", error);
      // Check for a specific error message from the backend if available
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center p-4 py-20 text-gray-900 ">
      <div className="shadow-lg rounded-2xl p-6 w-full max-w-lg bg-white">
        <h2 className="text-3xl font-extrabold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300 w-full pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                // Eye icon (inline SVG)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                // Eye-off icon (inline SVG)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye-off"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.06 18.06 0 0 1 5.47-5.12M12 10a2 2 0 0 0-3.18 2.18M2.06 2.06 22 22" />
                  <path d="M19.73 14.73A10.5 10.5 0 0 0 22 12c0-3-3-7-10-7C9.31 5 7.08 5.75 5.06 7.06" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
