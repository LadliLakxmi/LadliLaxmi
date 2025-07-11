// src/components/VerifyOtp.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // 60 seconds for resend
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId; // Get userId passed from Login component
    const identifier = location.state?.identifier; // Get identifier for resend logic
    const password = location.state?.password; // Get identifier for resend logic

    useEffect(() => {
        // Redirect if userId is not available (e.g., direct access to /verify-otp)
        if (!userId) {
            navigate("/account", { replace: true });
        }

        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
            clearInterval(timer);
        }

        return () => clearInterval(timer); // Cleanup timer on unmount
    }, [userId, navigate, resendTimer]);

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "https://ladlilakshmi.onrender.com/api/v1/auth/verify-otp",
                { userId, otp }
            );

            if (response.data.success) {
                const { token, user } = response.data;

                localStorage.setItem("token", token);
                localStorage.setItem("userId", user._id);
                localStorage.setItem("user", JSON.stringify(user));

                // Navigate to admin dashboard after successful OTP verification
                navigate("/Admindashboard/dashboard");
            } else {
                setError(response.data.message || "OTP verification failed.");
            }
        } catch (error) {
            console.error("Error during OTP verification:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred during OTP verification. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError("");
        setCanResend(false); // Disable resend button immediately
        setResendTimer(60); // Reset timer

        try {
            // Re-call the login endpoint to trigger a new OTP send
            // We pass the identifier (email/phone) to re-initiate the OTP flow
            const response = await axios.post(
                "https://ladlilakshmi.onrender.com/api/v1/auth/login",
                { identifier: identifier, password: password } // Password is not needed for resend, but backend might expect it.
                                                        // A better approach would be a dedicated resend OTP endpoint.
            );

            if (response.data.success && response.data.requiresOtpVerification) {
                // OTP resent successfully, message will be from backend
                setError("A new OTP has been sent to your email.");
            } else {
                setError(response.data.message || "Failed to resend OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error during OTP resend:", error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred during OTP resend. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-4 py-20 text-gray-900">
            <div className="shadow-lg rounded-2xl p-6 w-full max-w-lg bg-white">
                <h2 className="text-3xl font-extrabold text-center mb-6">Verify OTP</h2>
                {userId ? (
                    <p className="text-center text-gray-600 mb-4">
                        An OTP has been sent to your registered <strong>email</strong> for user {identifier}.
                    </p>
                ) : (
                    <p className="text-center text-red-500 mb-4">
                        User ID not found. Please go back to login.
                    </p>
                )}

                <form onSubmit={handleVerifyOtp} className="flex flex-col space-y-4">
                    <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        required
                        onChange={handleOtpChange}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition duration-300"
                        value={otp}
                        maxLength="6" // Assuming 6-digit OTP
                    />

                    {error && (
                        <p className="text-red-500 text-center text-sm mt-2">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-300 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="text-center mt-4">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-amber-600 hover:underline disabled:text-gray-400"
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <p className="text-gray-500">Resend OTP in {resendTimer} seconds</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;