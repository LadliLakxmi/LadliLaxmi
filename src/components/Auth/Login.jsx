import axios from "axios";
import React, { useState } from "react";
// If you're not using lucide-react, ensure these are available as inline SVGs or from another icon library
import { Eye, EyeOff } from 'lucide-react'; // Make sure lucide-react is installed: npm install lucide-react
import { useNavigate } from "react-router-dom";

const Login = () => {
  // State for form data, password visibility, error messages, and loading status
  const [formData, setFormData] = useState({
    identifier: "", // Changed from 'email' to 'identifier'
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        "https://ladlilakshmi.onrender.com/api/v1/auth/login",
        {
          // --- Key change here: send 'identifier' instead of 'email' ---
          identifier: formData.identifier,
          password: formData.password,
        }
      );

      if (response.data.success) {
        // Login successful
        const { token, user } = response.data;

        // Store token and user details in local storage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id); // Storing userId separately, as in your original code
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate based on user role
        if (user.role === "Admin") {
          navigate("/Admindashboard/dashboard");
        } else {
          navigate("/userdashboard");
        }
      } else {
        // Login failed
        setError(response.data.message || "Login failed. Please check your credentials.");
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
    <div className="flex justify-center items-center p-4  text-gray-900 ">
      <div className="shadow-lg rounded-2xl p-6 w-full max-w-lg bg-white">
        <h2 className="text-3xl font-extrabold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Input field for Email or Phone Number */}
          <input
            type="text" // Changed to 'text' as it can be either email or phone
            name="identifier" // Changed name to 'identifier'
            placeholder="Email or Phone Number" // Updated placeholder
            required
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
            value={formData.identifier} // Bind value to state
          />
          <div className="relative">
            {/* Password input field */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300 w-full pr-10"
              value={formData.password} // Bind value to state
            />
            {/* Toggle password visibility button */}
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"} // Added for accessibility
            >
              {/* Using Lucide React icons for Eye/EyeOff */}
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}

          {/* Login button */}
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
