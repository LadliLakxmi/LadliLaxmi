import React, { useEffect, useState } from "react";
import axios from "axios";

// Consider moving this config to a separate file (e.g., constants.js)
const MAX_WITHDRAWAL_PER_LEVEL = {
  1: 0,
  2: 100,
  3: 1000,
  4: 6000,
  5: 28000,
  6: 12000,
  7: 496000,
  8: 2016000,
  9: 8128000,
  10: 132640000,
  11: 130816000,
};

const Withdraw = ({ user }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    amount: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For button loading state

  const token = localStorage.getItem("token");

  const currentLevel = user?.currentLevel || 0;
  const maxAllowedForLevel = MAX_WITHDRAWAL_PER_LEVEL[currentLevel] || 0;
  const availableForWithdraw = Math.max(
    (user?.walletBalance || 0) - (user?.blockedForUpgrade || 0),
    0
  );

  const remainingLimit = Math.max(maxAllowedForLevel - alreadyWithdrawn, 0);
  const finalLimit = Math.min(availableForWithdraw, remainingLimit);

  useEffect(() => {
    if (user?.bankDetails) {
      setBankDetails(user.bankDetails);
    }

    const fetchWithdrawn = async () => {
      try {
        const res = await axios.get("https://ladlilaxmi.onrender.com/api/v1/withdraw/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAlreadyWithdrawn(res.data.alreadyWithdrawn || 0);
      } catch (err) {
        console.error("Failed to fetch withdrawn amount", err);
        setMessage("Failed to load withdrawal summary.");
        setMessageType("error");
      }
    };

    fetchWithdrawn();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    if (currentLevel < 1) {
      setMessage("Please upgrade before withdrawing.");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount.");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    if (amount > finalLimit) {
      setMessage(
        `You can only withdraw up to ₹${finalLimit.toFixed(2)} at your current level (Level ${currentLevel}).`
      );
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        amount,
        ...(bankDetails
          ? {} // If bank details exist, don't send them again
          : {
              bankDetails: {
                accountHolder: formData.accountHolder,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                bankName: formData.bankName,
              },
            }),
      };

      await axios.post("https://ladlilaxmi.onrender.com/api/v1/withdraw/request", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Withdraw request sent successfully!");
      setMessageType("success");
      setFormData((prev) => ({ ...prev, amount: "" }));
      // Optionally re-fetch withdrawn amount to update remaining limit
      // fetchWithdrawn(); // Uncomment if you want to update immediately
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error sending withdraw request.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full items-center justify-center mx-auto  px-4 sm:px-6 lg:px-8">
      <div className=" w-full lg:w-[60%] bg-white shadow-xl rounded-lg p-6 sm:p-8 border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
          <i className="fas fa-wallet mr-2 text-blue-600"></i>Withdraw Funds
        </h2>

        {/* Current Balances & Limits Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="flex justify-between items-center mb-1">
            <span className="font-semibold">Total Wallet Balance:</span>
            <span>₹{user?.walletBalance?.toFixed(2) || "0.00"}</span>
          </p>
          <p className="flex justify-between items-center mb-1">
            <span className="font-semibold">Blocked for Upgrade:</span>
            <span>₹{user?.blockedForUpgrade?.toFixed(2) || "0.00"}</span>
          </p>
          <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-base">
            <span>Available for Withdrawal:</span>
            <span>₹{availableForWithdraw.toFixed(2)}</span>
          </p>
          <hr className="my-3 border-blue-200" />
          <p className="flex justify-between items-center mb-1">
            <span className="font-semibold">Your Level:</span>
            <span>{currentLevel > 0 ? `Level ${currentLevel}` : "Not Upgraded"}</span>
          </p>
          <p className="flex justify-between items-center mb-1">
            <span className="font-semibold">Current Level Max Withdraw Limit:</span>
            <span>₹{maxAllowedForLevel.toFixed(2)}</span>
          </p>
          <p className="flex justify-between items-center mb-1">
            <span className="font-semibold">Already Withdrawn (This Level):</span>
            <span>₹{alreadyWithdrawn.toFixed(2)}</span>
          </p>
          <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-base">
            <span>Remaining Withdrawal Limit:</span>
            <span>₹{remainingLimit.toFixed(2)}</span>
          </p>
          <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-lg text-green-700">
            <span>Final Withdrawal Amount Cap:</span>
            <span>₹{finalLimit.toFixed(2)}</span>
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Bank Details Section (Conditional) */}
          {!bankDetails ? (
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Bank Details</h3>
              {["accountHolder", "accountNumber", "ifscCode", "bankName"].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                    {field === "accountHolder"
                      ? "Account Holder Name"
                      : field === "accountNumber"
                      ? "Account Number"
                      : field === "ifscCode"
                      ? "IFSC Code"
                      : "Bank Name"}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`Enter ${field === "accountHolder" ? "Account Holder Name" : field === "accountNumber" ? "Account Number" : field === "ifscCode" ? "IFSC Code" : "Bank Name"}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Saved Bank Details:</h3>
              <p>
                <strong>Account Holder:</strong> {bankDetails.accountHolder}
              </p>
              <p>
                <strong>Account Number:</strong> {bankDetails.accountNumber}
              </p>
              <p>
                <strong>IFSC Code:</strong> {bankDetails.ifscCode}
              </p>
              <p>
                <strong>Bank Name:</strong> {bankDetails.bankName}
              </p>
              <p className="mt-2 text-xs text-gray-600">
                To update bank details, please contact support.
              </p>
            </div>
          )}

          {/* Withdraw Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Withdraw Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min={1}
              max={finalLimit}
              placeholder={`Maximum: ₹${finalLimit.toFixed(2)}`}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm no-spinner"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || currentLevel < 1}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${currentLevel < 1 || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <i className="fas fa-paper-plane mr-2"></i>
            )}
            {isLoading ? "Sending Request..." : "Submit Withdraw Request"}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-6 p-3 rounded-md text-sm font-medium text-center
              ${messageType === "success"
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

export default Withdraw;
