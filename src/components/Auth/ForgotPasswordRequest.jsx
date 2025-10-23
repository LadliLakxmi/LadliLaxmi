// src/components/Auth/ForgotPasswordRequest.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your registered email.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://ladlilakshmi.onrender.com/api/v1/auth/forgot-password", {
        email,
      });
      if (response.data.success) {
        setMessage("A password reset link has been sent to your email.");
      } else {
        setError(response.data.message || "Failed to send reset email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 py-20 text-gray-900">
      <div className="shadow-lg rounded-2xl p-6 w-full max-w-md bg-white">
        <h2 className="text-3xl font-extrabold text-center mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-500 text-center">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 transition duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p
            onClick={() => navigate("/login")}
            className="mt-4 text-blue-600 cursor-pointer text-center"
          >
            Back to Login
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordRequest;
