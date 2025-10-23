// src/components/Auth/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `https://ladlilakshmi.onrender.com/api/v1/auth/reset-password/${token}`,
        { newPassword }
      );
      if (res.data.success) {
        setSuccessMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(res.data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 py-20 text-gray-900">
      <div className="shadow-lg rounded-2xl p-6 w-full max-w-md bg-white">
        <h2 className="text-3xl font-extrabold text-center mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 transition duration-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
