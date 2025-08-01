// src/components/ChangePasswordForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { Key, X, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

const ChangePasswordForm = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New state variables for password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    // Basic client-side validation
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm new password do not match.");
      setLoading(false);
      return;
    }

    // Ensure new password meets minimum length requirement from your schema
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token"); // Get the authentication token from localStorage

    try {
      const response = await axios.post(
        // `https://ladlilakshmi.onrender.com/api/v1/auth/change-password`, // Ensure this matches your backend route
        `https://ladlilakshmi.onrender.com/api/v1/auth/changepassword`, // Ensure this matches your backend route
        { oldPassword, newPassword, confirmNewPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the authorization token
          },
        }
      );
      setSuccess(response.data.message || "Password updated successfully!");
      // Clear form fields on successful password change
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      // Optionally, close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      // Display specific error message from the backend if available
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute  top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <Key size={28} className="text-purple-600" /> Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password Field */}
          <div>
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Old Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"} // Dynamically set type
                id="oldPassword"
                className="mt-1 text-black block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={
                  showOldPassword ? "Hide old password" : "Show old password"
                }
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"} // Dynamically set type
                id="newPassword"
                className="mt-1 text-black block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={
                  showNewPassword ? "Hide new password" : "Show new password"
                }
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"} // Dynamically set type
                id="confirmNewPassword"
                className="mt-1 text-black block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmNewPassword
                    ? "Hide confirmed new password"
                    : "Show confirmed new password"
                }
              >
                {showConfirmNewPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Display error messages */}
          {error && (
            <p className="text-red-600 text-sm mt-2 text-center flex items-center justify-center gap-1">
              <AlertCircle size={16} /> {error}
            </p>
          )}
          {/* Display success messages */}
          {success && (
            <p className="text-green-600 text-sm mt-2 text-center flex items-center justify-center gap-1">
              <CheckCircle size={16} /> {success}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-white rounded-full"></span>
                Changing Password...
              </>
            ) : (
              <>
                <Key size={20} /> Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
