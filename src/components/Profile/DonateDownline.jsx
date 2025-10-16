import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DonateDownline = ({ user, fetchUserData }) => {
  const [recipientReferralCode, setRecipientReferralCode] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState(""); // New password field
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downlineUserName, setDownlineUserName] = useState("");
  const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
  const [referralCodeError, setReferralCodeError] = useState("");
  const [isValidUser, setIsValidUser] = useState(true);

  const token = localStorage.getItem("token");

  // Debounce for referral verification
  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Referral code verification
  const verifyReferralCode = useCallback(
    async (code) => {
      setReferralCodeError("");
      setDownlineUserName("");
      if (!code || code.length < 3) {
        setIsVerifyingReferral(false);
        return;
      }

      if (code === user.referralCode) {
      setReferralCodeError("You cannot donate to your own referral code.");
      setDownlineUserName("");
      setIsVerifyingReferral(false);
      return;
    }

      setIsVerifyingReferral(true);

      try {
        const response = await axios.get(
          `https://ladlilakshmi.onrender.com/api/v1/donations/get-user-by-referral/${code}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setDownlineUserName(response.data.user.name);
        } else {
          setDownlineUserName("");
          setReferralCodeError(response.data.message || "User not found.");
        }
      } catch (error) {
        setDownlineUserName("");
        const errorMessage =
          error.response?.data?.message || "Failed to verify referral code.";
        setReferralCodeError(errorMessage);
      } finally {
        setIsVerifyingReferral(false);
      }
    },
    [token,]
  );

  const debouncedVerifyReferralCode = useCallback(
    debounce(verifyReferralCode, 500),
    [verifyReferralCode]
  );

  useEffect(() => {
    if (recipientReferralCode) {
      debouncedVerifyReferralCode(recipientReferralCode);
    } else {
      setDownlineUserName("");
      setReferralCodeError("");
    }
    return () => debouncedVerifyReferralCode.cancel && debouncedVerifyReferralCode.cancel();
  }, [recipientReferralCode, debouncedVerifyReferralCode]);

  // Fund transfer handler
  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    if (!recipientReferralCode || !amount || !password) {
      setMessage("Please enter referral code, amount, and password.");
      setMessageType("error");
      toast.error("Please enter referral code, amount, and password.");
      setIsLoading(false);
      return;
    }
    if (!downlineUserName || referralCodeError) {
      setMessage("Please enter a valid referral code and ensure the user's name displays.");
      setMessageType("error");
      toast.error("Please enter a valid referral code and ensure the user's name displays.");
      setIsLoading(false);
      return;
    }
    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage("Please enter a valid positive amount.");
      setMessageType("error");
      toast.error("Please enter a valid positive amount.");
      setIsLoading(false);
      return;
    }
    const activeDirectMembers = user?.directReferrals?.filter((ref) => Number(ref.currentLevel) >= 1).length || 0;
    if (activeDirectMembers < 2) {
      toast.error("You need at least 2 direct members activated to Level 1 or higher.");
      setIsValidUser(false);
      setIsLoading(false);
      return;
    }
    if (user && user.walletBalance < transferAmount) {
      setMessage(`Insufficient wallet balance. You have ₹${user.walletBalance.toFixed(2)} available.`);
      setMessageType("error");
      toast.error(`Insufficient wallet balance. You have ₹${user.walletBalance.toFixed(2)} available.`);
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "https://ladlilakshmi.onrender.com/api/v1/donations/transfer-to-downline",
        { recipientReferralCode, amount: transferAmount, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage(response.data.message);
      setMessageType("success");
      toast.success(response.data.message);
      setRecipientReferralCode("");
      setAmount("");
      setPassword(""); // Clear password field
      setDownlineUserName("");
      setReferralCodeError("");
      if (fetchUserData) {
        fetchUserData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to transfer funds. Try again.";
      setMessage(errorMessage);
      setMessageType("error");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center sm:p-4 items-start lg:p-2">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg sm:p-8 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-6">
          Transfer Funds to Downline
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="flex justify-between items-center font-bold text-base">
            <span>Your Current Wallet Balance:</span>
            <span>₹{user?.walletBalance?.toFixed(2) || "0.00"}</span>
          </p>
        </div>
        <form onSubmit={handleTransfer} className="space-y-6">
          <div>
            <label
              htmlFor="recipientReferralCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Downline User's Referral Code
            </label>
            <input
              type="text"
              id="recipientReferralCode"
              name="recipientReferralCode"
              value={recipientReferralCode}
              onChange={(e) => setRecipientReferralCode(e.target.value)}
              required
              className={`mt-1 block w-full px-3 py-2 border ${referralCodeError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500`}
              placeholder="e.g., ABC123DEF"
            />
            {isVerifyingReferral && (
              <p className="mt-2 text-sm text-gray-600">Verifying referral code...</p>
            )}
            {downlineUserName && !isVerifyingReferral && !referralCodeError && (
              <p className="mt-2 text-sm text-green-600">
                Downline User: <span className="font-semibold">{downlineUserName}</span>
              </p>
            )}
            {referralCodeError && !isVerifyingReferral && (
              <p className="mt-2 text-sm text-red-600">{referralCodeError}</p>
            )}
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Transfer (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 no-spinner"
              placeholder="e.g., 500.00"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isVerifyingReferral || !downlineUserName || referralCodeError || amount <= 0}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                (isLoading || isVerifyingReferral || !downlineUserName || referralCodeError || amount <= 0)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : isValidUser ? "Transfer Funds" : "You need at least 2 direct members who have activated to Level 1 or higher to withdraw."}
          </button>
        </form>
        {message && (
          <div
            className={`mt-6 p-3 rounded-md text-sm font-medium text-center ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateDownline;
