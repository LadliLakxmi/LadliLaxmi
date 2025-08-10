import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  IndianRupee,
  Wallet,
  Banknote,
  Landmark,
  ArrowUpCircle,
} from "lucide-react";
import WithdrawHistory from "./WithdrawHistory";
import { useNavigate } from "react-router-dom";

// --- Removed all INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL and calculateCumulativeMaxWithdrawal ---
// These are no longer relevant as cumulative limits are removed from the backend for the main wallet.

const Withdraw = ({ user, fetchUserData }) => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState(null);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "", // Use upiId instead of phoneNumber if that's what backend expects
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // To prevent multiple pending requests

  const token = localStorage.getItem("token");

  const currentLevel = Number(user?.currentLevel) || 0;
  // --- Start of Changes: Calculate active direct members ---
  const activeDirectMembers =
    user?.directReferrals?.filter((ref) => Number(ref.currentLevel) >= 1)
      .length || 0;
  // --- End of Changes ---
  // Get the next upgrade cost (still relevant for display)
  const INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL_FRONTEND = {
    // Re-add for nextUpgradeCost display
    1: { nextUpgradeCost: 400 },
    2: { nextUpgradeCost: 500 },
    3: { nextUpgradeCost: 1000 },
    4: { nextUpgradeCost: 2000 },
    5: { nextUpgradeCost: 4000 },
    6: { nextUpgradeCost: 8000 },
    7: { nextUpgradeCost: 16000 },
    8: { nextUpgradeCost: 32000 },
    9: { nextUpgradeCost: 64000 },
    10: { nextUpgradeCost: 128000 },
    11: { nextUpgradeCost: 256000 },
    12: { nextUpgradeCost: 0 },
  };
  const nextLevelToUpgrade = currentLevel + 1;
  const nextUpgradeCost =
    INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL_FRONTEND[nextLevelToUpgrade]
      ?.nextUpgradeCost || 0;

  useEffect(() => {
    // Corrected bank details handling
    if (user && user.bankDetails) {
      setFormData((prev) => ({
        ...prev,
        accountHolder: user.bankDetails.accountHolder || "",
        accountNumber: user.bankDetails.accountNumber || "",
        ifscCode: user.bankDetails.ifscCode || "",
        bankName: user.bankDetails.bankName || "",
        upiId: user.bankDetails.upiId || "", // Assuming this is now 'upiId'
      }));
      // Check if any of the bank details are non-empty strings to set bankDetails
      const hasAnyBankDetail = Object.values(user.bankDetails).some(
        (detail) => typeof detail === "string" && detail.trim() !== ""
      );
      setBankDetails(hasAnyBankDetail ? user.bankDetails : null);
    } else {
      setFormData((prev) => ({
        ...prev,
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        upiId: "",
      }));
      setBankDetails(null);
    }

    const fetchWithdrawalStatus = async () => {
      try {
        const res = await axios.get(
          "https://ladlilakshmi.onrender.com/api/v1/withdraw/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const pendingRequest = res.data.requests.some(
          (req) => req.status === "pending"
        );
        setHasPendingRequest(pendingRequest);
      } catch (err) {
        console.error("Failed to fetch withdrawal status", err);
        toast.error("Failed to load withdrawal status.");
      }
    };

    if (token) {
      fetchWithdrawalStatus();
    }
  }, [user, token]); // fetchUserData is not needed here as it's passed as a prop, not a state dependency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (currentLevel < 1) {
      toast.error("Please upgrade to Level 1 before withdrawing.");
      setIsLoading(false);
      return;
    }

    // --- Start of Changes: Check for active direct members before withdrawal ---
    if (activeDirectMembers < 2) {
      toast.error(
        "You need at least 2 direct members who have activated to Level 1 or higher to withdraw."
      );
      setIsLoading(false);
      return;
    }
    // --- End of Changes ---

    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount to withdraw.");
      setIsLoading(false);
      return;
    }

    let WalletBalance = Number(user?.walletBalance) || 0;

    if (amount > WalletBalance) {
      toast.error(`Insufficient funds in your Wallet.`);
      setIsLoading(false);
      return;
    }

    if (hasPendingRequest) {
      toast.error(
        "You already have a pending withdrawal request. Please wait for it to be processed."
      );
      setIsLoading(false);
      return;
    }

    // --- Bank Details Saving Logic ---
    // Only check if bankDetails are NOT saved on the user object
    if (!bankDetails) {
      if (
        !formData.accountHolder ||
        !formData.accountNumber ||
        !formData.ifscCode ||
        !formData.bankName
      ) {
        toast.error("Please fill in all required bank details.");
        setIsLoading(false);
        return;
      }

      try {
        await axios.put(
          "https://ladlilakshmi.onrender.com/api/v1/profile/bank-details",
          {
            accountHolder: formData.accountHolder,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            bankName: formData.bankName,
            upiId: formData.upiId || "", // UPI ID is optional
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Bank details saved successfully!");
        // Update local state to reflect saved bank details
        setBankDetails({
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          upiId: formData.upiId || "",
        });
        if (fetchUserData) {
          await fetchUserData(); // Refresh user data to get updated bank details
        }
      } catch (err) {
        console.error("Error saving bank details:", err);
        toast.error(
          err.response?.data?.message ||
            "An error occurred while saving bank details."
        );
        setIsLoading(false);
        return;
      }
    }
    // --- End Bank Details Saving Logic ---

    // Proceed with withdrawal request
    try {
      const payload = {
        amount,
        // Send bankDetails only if they were *just* entered/updated in this request,
        // otherwise, the backend will use the saved ones.
        // This handles the scenario where details are required for the first time.
        bankDetails: !bankDetails
          ? {
              accountHolder: formData.accountHolder,
              accountNumber: formData.accountNumber,
              ifscCode: formData.ifscCode,
              bankName: formData.bankName,
              upiId: formData.upiId || "",
            }
          : undefined, // If bankDetails are already saved, no need to send them again
      };
      await axios.post(
        "https://ladlilakshmi.onrender.com/api/v1/withdraw/request",
        payload,
        {
          // Endpoint change: /withdraw
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Withdraw request submitted successfully! It will be processed shortly."
      );
      setFormData((prev) => ({ ...prev, amount: "" })); // Clear amount field

      // Re-fetch user data to update wallet balances and pending request status
      if (fetchUserData) {
        await fetchUserData();
        setHasPendingRequest(true); // Assume pending after successful submission
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while sending your withdraw request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center p-4">
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

        <h2 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
          <Banknote size={36} /> Withdraw Your Earnings
        </h2>

        {/* Current Balances & Rules Section */}
        <div className="bg-green-700/50 border border-green-600 rounded-lg p-4 mb-6 text-base text-green-100 shadow-md">
          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold flex items-center">
              <Wallet size={20} className="mr-2" />
              Main Wallet Balance:
            </span>
            <span className="font-bold text-yellow-300">
              ₹{(Number(user?.walletBalance) || 0).toFixed(2)}
            </span>
          </p>

          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold flex items-center">
              <Wallet size={20} className="mr-2" />
              Upgrade Wallet Balance:
            </span>
            <span className="font-bold text-yellow-300">
              ₹{(Number(user?.upgradewalletBalance) || 0).toFixed(2)}
            </span>
          </p>

          <hr className="my-3 border-green-600" />

          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold">Your Current Level:</span>
            <span className="font-bold">
              {currentLevel > 0 ? `Level ${currentLevel}` : "Not Upgraded"}
            </span>
          </p>
          {/* --- Start of Changes: Conditional messages based on currentLevel and activeDirectMembers --- */}
          {currentLevel < 1 ? (
            <p className="text-red-300 font-bold text-center mt-3">
              <IndianRupee className="inline-block mr-1" size={20} /> You must
              activate to Level 1 to withdraw funds.
            </p>
          ) : activeDirectMembers < 2 ? (
            <p className="text-lg text-red-300 font-medium text-center mt-3">
              You need 2 direct members with active Account to upline 1 or
              higher to withdraw. You currently have {activeDirectMembers}{" "}
              Active Only .
            </p>
          ) : (
            <p className="text-lg text-green-300 font-medium text-center mt-3">
              You meet the direct member requirement for withdrawal.
            </p>
          )}
          {/* --- End of Changes --- */}

          {nextLevelToUpgrade <=
            Object.keys(INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL_FRONTEND)
              .length && (
            <p className="flex justify-between items-center border-t border-green-600 pt-3 mt-3 font-semibold text-yellow-100">
              <span className="flex items-center gap-1">
                Next Level Upgrade Cost (Level {nextLevelToUpgrade}):
              </span>
              <span className="font-bold text-yellow-300">
                {nextUpgradeCost > 0
                  ? `₹${nextUpgradeCost.toFixed(2)}`
                  : "Max Level Reached!"}
              </span>
            </p>
          )}

          <p
            onClick={() => {
              navigate("/userdashboard/moneyTransfer");
            }}
            className=" border-2 border-white px-6 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-95 hover:shadow-lg py-2 mt-4 rounded-xl text-center font-semibold bg-white text-green-800 "
          >
            Transfer Main wallet to Upgrade Wallet
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          {/* Bank Details Section (Conditional) */}
          {!bankDetails ? (
            <div className="bg-green-700/30 p-5 rounded-lg shadow-inner">
              <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <Landmark size={24} /> Enter Bank Details
              </h3>
              {[
                {
                  label: "Account Holder Name",
                  name: "accountHolder",
                  type: "text",
                },
                {
                  label: "Account Number",
                  name: "accountNumber",
                  type: "text",
                },
                { label: "IFSC Code", name: "ifscCode", type: "text" },
                { label: "Bank Name", name: "bankName", type: "text" },
                { label: "UPI ID (Optional)", name: "upiId", type: "text" }, // Changed to UPI ID
              ].map((field) => (
                <div key={field.name} className="mb-4 last:mb-0">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-green-100 mb-1"
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.name !== "upiId"} // UPI ID is optional
                    className="mt-1 block w-full px-4 py-2 bg-green-900/60 border border-green-600 rounded-md shadow-sm text-white placeholder-green-200 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                    placeholder={`Enter ${field.label}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-700/30 border border-yellow-600 rounded-lg p-5 text-sm text-yellow-100 shadow-md">
              <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <Landmark size={24} /> Your Saved Bank Details:
              </h3>
              <p className="mb-2">
                <strong>Account Holder:</strong> {bankDetails.accountHolder}
              </p>
              <p className="mb-2">
                <strong>Account Number:</strong> {bankDetails.accountNumber}
              </p>
              <p className="mb-2">
                <strong>IFSC Code:</strong> {bankDetails.ifscCode}
              </p>
              <p className="mb-2">
                <strong>Bank Name:</strong> {bankDetails.bankName}
              </p>
              {bankDetails.upiId && ( // Display UPI ID if present
                <p className="mb-2">
                  <strong>UPI ID:</strong> {bankDetails.upiId}
                </p>
              )}
              <p className="mt-4 text-xs text-yellow-200 opacity-80">
                To update your bank details, please contact customer support for
                security reasons.
              </p>
            </div>
          )}

          {/* Withdraw Amount Input */}
          <div className="mt-4">
            <label
              htmlFor="amount"
              className="block text-lg font-medium text-yellow-300 mb-2 flex items-center gap-2"
            >
              <IndianRupee size={24} /> Withdraw Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min={1}
              // Set max attribute dynamically based on the selected wallet's balance
              placeholder={(Number(user?.walletBalance) || 0).toFixed(2)}
              className="mt-1 block w-full text-white placeholder-green-200 px-4 py-3 border border-green-600 rounded-lg shadow-inner bg-green-900/60 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-lg no-spinner"
            />
          </div>
          <div class="p-4 bg-blue-50 rounded-lg shadow-md text-blue-800 text-lg font-semibold">
            You will get after 10% deduction: ₹{Number(formData.amount) * 0.9}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isLoading ||
              hasPendingRequest ||
              currentLevel < 1 ||
              Number(formData.amount) <= 0 ||
              (Number(user?.walletBalance) || 0) <= 0 ||
              activeDirectMembers < 2
            }
            className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg font-extrabold text-lg transition-all duration-300 ease-in-out transform
              ${
                currentLevel < 1 ||
                isLoading ||
                hasPendingRequest ||
                Number(formData.amount) <= 0 ||
                (Number(user?.walletBalance) || 0) <= 0 ||
                activeDirectMembers < 2
                  ? "bg-gray-600 text-gray-300 opacity-80 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-orange-600 text-purple-900 hover:from-yellow-600 hover:to-orange-700 hover:scale-105 active:scale-95"
              }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
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
            ) : hasPendingRequest ? (
              <span className="flex items-center gap-2">
                <ArrowUpCircle size={24} /> Pending Request
              </span>
            ) : activeDirectMembers < 2 ? (
              <span className="flex items-center gap-2">
                <Banknote size={24} /> Need 2 Active Direct Members
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Banknote size={24} /> Submit Withdraw Request
              </span>
            )}
          </button>
        </form>

        <WithdrawHistory />
      </div>
    </div>
  );
};

export default Withdraw;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from 'react-toastify';
// import { IndianRupee, Wallet, Banknote, Landmark, ArrowUpCircle } from 'lucide-react';
// import WithdrawHistory from "./WithdrawHistory";
// import { useNavigate } from "react-router-dom";
// // Define INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL as the *individual* limit for each level,
// // and we will sum them up dynamically.
// const INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL = {
//   1: { withdrawLimit: 0, nextUpgradeCost: 300 },
//   2: { withdrawLimit: 100, nextUpgradeCost: 500 },
//   3: { withdrawLimit: 1000, nextUpgradeCost: 1000 },
//   4: { withdrawLimit: 6000, nextUpgradeCost: 2000 },
//   5: { withdrawLimit: 28000, nextUpgradeCost: 4000 },
//   6: { withdrawLimit: 120000, nextUpgradeCost: 8000 },
//   7: { withdrawLimit: 496000, nextUpgradeCost: 16000 },
//   8: { withdrawLimit: 2016000, nextUpgradeCost: 32000 },
//   9: { withdrawLimit: 8128000, nextUpgradeCost: 64000 },
//   10: { withdrawLimit: 32640000, nextUpgradeCost: 128000 },
//   11: { withdrawLimit: 130816000, nextUpgradeCost: 0 },
// };

// // Helper function to calculate cumulative max withdrawal
// const calculateCumulativeMaxWithdrawal = (currentLevel) => {
//   let cumulativeMax = 0;
//   for (let level = 1; level <= currentLevel; level++) {
//     cumulativeMax += INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL[level]?.withdrawLimit || 0;
//   }
//   return cumulativeMax;
// };

// const Withdraw = ({ user, fetchUserData }) => {
//     const navigate = useNavigate();
//   const [bankDetails, setBankDetails] = useState(null);
//   const [formData, setFormData] = useState({
//     walletType: "", // Initialize as empty string
//     accountHolder: "",
//     accountNumber: "",
//     ifscCode: "",
//     bankName: "",
//     phoneNumber: "",
//     amount: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const token = localStorage.getItem("token");

//   // Ensure currentLevel is a number, default to 0 if null/undefined
//   const currentLevel = Number(user?.currentLevel) || 0;

//   // Calculate the CUMULATIVE max allowed for the user's current level
//   const maxAllowedForCurrentLevelCumulative = calculateCumulativeMaxWithdrawal(currentLevel);

//   const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);

//   // Remaining withdrawal limit based on the cumulative max
//   const remainingLimitForLevel = Math.max(maxAllowedForCurrentLevelCumulative - alreadyWithdrawn, 0);

//   // The final withdrawal cap is the minimum of wallet balance and the remaining cumulative limit
//   // FIX: Ensure user?.walletBalance is treated as a number
//   const finalWithdrawalCap = Math.min(Number(user?.walletBalance) || 0, remainingLimitForLevel);

//   // Get the next upgrade cost
//   const nextLevelToUpgrade = currentLevel + 1;
//   const nextUpgradeCost = INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL[nextLevelToUpgrade]?.nextUpgradeCost || 0;

//   useEffect(() => {
//     // Corrected bank details handling
//     if (user && user.bankDetails) {
//       setFormData((prev) => ({
//         ...prev,
//         accountHolder: user.name || "", // Assuming user.name is account holder
//         accountNumber: user.bankDetails.accountNumber || "",
//         ifscCode: user.bankDetails.ifscCode || "",
//         bankName: user.bankDetails.bankName || "",
//         phoneNumber: user.bankDetails.phoneNumber || "",
//       }));
//       // Check if any of the bank details are non-empty strings to set bankDetails
//       const hasAnyBankDetail = Object.values(user.bankDetails).some(
//         detail => typeof detail === 'string' && detail.trim() !== ''
//       );
//       setBankDetails(hasAnyBankDetail ? user.bankDetails : null);
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         accountHolder: "",
//         accountNumber: "",
//         ifscCode: "",
//         bankName: "",
//         phoneNumber: "",
//       }));
//       setBankDetails(null);
//     }

//     const fetchWithdrawn = async () => {
//       try {
//         const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/withdraw/summary", {
//         // const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/withdraw/summary", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: { // This is where you add query parameters
//            walletType: walletType,
//            },
//         });
//         setAlreadyWithdrawn(Number(res.data.alreadyWithdrawn) || 0); // Ensure it's a number
//       } catch (err) {
//         console.error("Failed to fetch withdrawn amount", err);
//         toast.error("Failed to load withdrawal summary.");
//       }
//     };

//     if (token) { // Only fetch if token exists
//       fetchWithdrawn();
//     }
//   }, [user, token]); // Add fetchUserData to dependency array if you want it to re-run when fetchUserData changes (unlikely)

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleWithdraw = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (currentLevel < 1) {
//       toast.error("Please upgrade to Level 1 before withdrawing.");
//       setIsLoading(false);
//       return;
//     }

//     const amount = Number(formData.amount);
//     const walletType = formData.walletType; // It's already a string from the select

//     if (!amount || amount <= 0) {
//       toast.error("Please enter a valid amount to withdraw.");
//       setIsLoading(false);
//       return;
//     }
//     if (!walletType) { // Ensure a wallet type is selected
//         toast.error("Please select a wallet type to withdraw from.");
//         setIsLoading(false);
//         return;
//     }

//     // Wallet-specific balance and validation
//     let selectedWalletBalance = 0;
//     let withdrawalLimitApplied = finalWithdrawalCap; // Default to main wallet's calculated cap

//     if (walletType === "main") {
//       selectedWalletBalance = Number(user?.walletBalance) || 0;
//       // For main wallet, validate against finalWithdrawalCap (which includes cumulative limit)
//       if (amount > withdrawalLimitApplied) {
//         toast.error(
//           `Withdrawal amount exceeds your current limit or available balance in Main Wallet. You can only withdraw up to ₹${finalWithdrawalCap.toFixed(2)}.`
//         );
//         setIsLoading(false);
//         return;
//       }
//     } else if (walletType === "sponser") { // Note the spelling "sponser" from your option value
//       selectedWalletBalance = Number(user?.sponserwalletBalance) || 0;
//       // For sponser wallet, apply specific limits if any, otherwise just wallet balance
//       // Currently, your INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL applies only to 'main' wallet withdrawals.
//       // If sponser wallet has different rules, implement them here.
//       // For now, let's just check against sponser wallet's balance.
//       if (amount > selectedWalletBalance) {
//           toast.error(`Withdrawal amount exceeds your available balance in sponser Wallet. You can only withdraw up to ₹${selectedWalletBalance.toFixed(2)}.`);
//           setIsLoading(false);
//           return;
//       }
//       // If sponser wallet also contributes to cumulative limit, you'd need more complex logic here.
//       // Assuming sponser wallet has no external cumulative limit for simplicity based on your current code.
//     } else {
//         toast.error("Invalid wallet type selected.");
//         setIsLoading(false);
//         return;
//     }

//     // General balance check for the selected wallet
//     if (amount > selectedWalletBalance) {
//         toast.error(`Insufficient funds in your ${walletType === 'main' ? 'Main' : 'sponser'} Wallet.`);
//         setIsLoading(false);
//         return;
//     }

//     // --- Bank Details Saving Logic ---
//     if (!bankDetails || !bankDetails.accountNumber) {
//       if (!formData.accountHolder || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.phoneNumber) {
//         toast.error("Please fill in all bank details and your phone number to proceed.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         await axios.put("https://ladlilakshmi.onrender.com/api/v1/profile/bank-details", {
//           accountHolder: formData.accountHolder,
//           accountNumber: formData.accountNumber,
//           ifscCode: formData.ifscCode,
//           bankName: formData.bankName,
//           phoneNumber: formData.phoneNumber,
//         }, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         toast.success("Bank details saved successfully!");

//         setBankDetails({
//           accountHolder: formData.accountHolder,
//           accountNumber: formData.accountNumber,
//           ifscCode: formData.ifscCode,
//           bankName: formData.bankName,
//           phoneNumber: formData.phoneNumber,
//         });

//         if (fetchUserData) {
//           await fetchUserData(); // Refresh user data after saving bank details
//         }
//       } catch (err) {
//         console.error("Error saving bank details:", err);
//         toast.error(err.response?.data?.message || "An error occurred while saving bank details.");
//         setIsLoading(false);
//         return;
//       }
//     }
//     // --- End Bank Details Saving Logic ---

//     // Proceed with withdrawal request
//     try {
//       const payload = { walletType, amount }; // Use the validated amount and walletType
//       await axios.post("https://ladlilakshmi.onrender.com/api/v1/withdraw/request", payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       toast.success("Withdraw request submitted successfully! It will be processed shortly.");
//       setFormData((prev) => ({ ...prev, amount: "" })); // Clear amount field

//       // Optimistic update for alreadyWithdrawn only if withdrawing from the main wallet,
//       // assuming sponser wallet withdrawals don't count towards the cumulative limit.
//       if(walletType === "main"){
//         setAlreadyWithdrawn(prev => prev + amount);
//       }
//       // Also, refetch user data to update wallet balances immediately
//       if (fetchUserData) {
//         await fetchUserData();
//       }

//     } catch (err) {
//       console.error("Withdrawal error:", err);
//       toast.error(err.response?.data?.message || "An error occurred while sending your withdraw request.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className='flex min-h-[calc(100vh-150px)] items-center justify-center p-4'>
//       <ToastContainer
//         position="top-center"
//         autoClose={4000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />
//       <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
//         {/* Decorative background elements */}
//         <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
//         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

//         <h2 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
//           <Banknote size={36} /> Withdraw Your Earnings
//         </h2>

//         {/* Current Balances & Limits Section */}
//         <div className="bg-green-700/50 border border-green-600 rounded-lg p-4 mb-6 text-base text-green-100 shadow-md">
//           <p className="flex justify-between items-center mb-2">
//             <span className="font-semibold flex items-center"><Wallet size={20} className="mr-2" />Main Wallet Balance:</span> {/* Clarified label */}
//             <span className="font-bold text-yellow-300">₹{(Number(user?.walletBalance) || 0).toFixed(2)}</span> {/* FIX: Ensure it's a number */}
//           </p>

//           <p className="flex justify-between items-center mb-2">
//             <span className="font-semibold flex items-center"><Wallet size={20} className="mr-2" />sponser Wallet Balance:</span> {/* Clarified label */}
//             {/* FIX: Ensure user?.sponserwalletBalance is treated as a number */}
//             <span className="font-bold text-yellow-300">₹{(Number(user?.sponserwalletBalance) || 0).toFixed(2)}</span>
//           </p>

//           <hr className="my-3 border-green-600" />

//           <p className="flex justify-between items-center mb-2">
//             <span className="font-semibold">Your Current Level:</span>
//             <span className="font-bold">{currentLevel > 0 ? `Level ${currentLevel}` : "Not Upgraded"}</span>
//           </p>
//           <p className="flex justify-between items-center mb-2">
//             <span className="font-semibold">Cumulative Max Withdraw Limit:</span>
//             <span className="font-bold">₹{maxAllowedForCurrentLevelCumulative.toFixed(2)}</span>
//           </p>
//           <p className="flex justify-between items-center mb-2">
//             <span className="font-semibold">Already Withdrawn:</span>
//             <span className="font-bold">₹{alreadyWithdrawn.toFixed(2)}</span>
//           </p>
//           {nextLevelToUpgrade <= Object.keys(INDIVIDUAL_MAX_WITHDRAWAL_PER_LEVEL).length && (
//             <p className="flex justify-between items-center border-t border-green-600 pt-3 mt-3 font-semibold text-yellow-100">
//               <span className="flex items-center gap-1">Next Level Upgrade Cost (Level {nextLevelToUpgrade}):</span>
//               <span className="font-bold text-yellow-300">
//                 {nextUpgradeCost > 0 ? `₹${nextUpgradeCost.toFixed(2)}` : "Max Level Reached!"}
//               </span>
//             </p>
//           )}
//           <p className="flex justify-between items-center border-t border-b border-green-600 pt-3 mt-3 font-bold text-lg text-yellow-100">
//             <span>Main Wallet Withdrawal Cap:</span> {/* Clarified this is for Main Wallet */}
//             <span>₹{finalWithdrawalCap.toFixed(2)}</span>
//           </p>

//           <p className="flex items-center justify-center text-lg mt-2">Use Sponser Money for Upgrade <span className="text-3xl">↓</span></p>
//           <p onClick={()=>{navigate('/userdashboard/moneyTransfer')}} className=" border-2 border-white px-6 cursor-pointer transition-transform duration-300 ease-in-out hover:scale-95 hover:shadow-lg py-2 mt-4 rounded-xl text-center font-semibold bg-white text-green-800 ">
//             Transfer Sponer Money to Main Wallet </p>
//         </div>

//         <form onSubmit={handleWithdraw} className="space-y-6">
//           {/* Bank Details Section (Conditional) */}
//           {!bankDetails ? (
//             <div className="bg-green-700/30 p-5 rounded-lg shadow-inner">
//               <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
//                 <Landmark size={24} /> Enter Bank Details
//               </h3>
//               {[
//                 { label: "Account Holder Name", name: "accountHolder", type: "text" },
//                 { label: "Account Number", name: "accountNumber", type: "text" },
//                 { label: "IFSC Code", name: "ifscCode", type: "text" },
//                 { label: "Bank Name", name: "bankName", type: "text" },
//                 { label: "Phone Number", name: "phoneNumber", type: "tel" },
//               ].map((field) => (
//                 <div key={field.name} className="mb-4 last:mb-0">
//                   <label htmlFor={field.name} className="block text-sm font-medium text-green-100 mb-1">
//                     {field.label}
//                   </label>
//                   <input
//                     type={field.type}
//                     id={field.name}
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full px-4 py-2 bg-green-900/60 border border-green-600 rounded-md shadow-sm text-white placeholder-green-200 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
//                     placeholder={`Enter ${field.label}`}
//                   />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="bg-yellow-700/30 border border-yellow-600 rounded-lg p-5 text-sm text-yellow-100 shadow-md">
//               <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
//                 <Landmark size={24} /> Your Saved Bank Details:
//               </h3>
//               <p className="mb-2"><strong>Account Holder:</strong> {bankDetails.accountHolder}</p>
//               <p className="mb-2"><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
//               <p className="mb-2"><strong>IFSC Code:</strong> {bankDetails.ifscCode}</p>
//               <p className="mb-2"><strong>Bank Name:</strong> {bankDetails.bankName}</p>
//               {bankDetails.phoneNumber && (
//                 <p className="mb-2"><strong>Phone Number:</strong> {bankDetails.phoneNumber}</p>
//               )}
//               <p className="mt-4 text-xs text-yellow-200 opacity-80">
//                 To update your bank details, please contact customer support for security reasons.
//               </p>
//             </div>
//           )}

//           {/* Wallet Type Selection */}
//           <div className="mt-8">
//             <label htmlFor="walletType" className="block text-lg font-medium text-yellow-300 mb-2 flex items-center gap-2">
//               <Wallet size={24} /> Choose Wallet Type to Withdraw
//             </label>
//             <select
//               id="walletType"
//               name="walletType"
//               value={formData.walletType}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full text-white px-4 py-3 border border-green-600 rounded-lg shadow-inner bg-green-900/60 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-lg"
//             >
//               <option value="" disabled>Select a wallet</option>
//               <option value="main">Main Wallet</option>
//               <option value="sponser">Sponser Wallet</option> {/* Ensure 'sponser' matches your backend expectation */}
//             </select>
//           </div>

//           {/* Withdraw Amount Input */}
//           <div className="mt-4">
//             <label htmlFor="amount" className="block text-lg font-medium text-yellow-300 mb-2 flex items-center gap-2">
//               <IndianRupee size={24} /> Withdraw Amount (₹)
//             </label>
//             <input
//               type="number"
//               id="amount"
//               name="amount"
//               value={formData.amount}
//               onChange={handleChange}
//               required
//               min={1}
//               // The max attribute of the input should dynamically change based on selected wallet
//               // For now, let's keep it based on finalWithdrawalCap for main, but note this
//               // limitation if sponser wallet has a different cap. It's better to validate on submit.
//               max={formData.walletType === 'main' ? finalWithdrawalCap : (Number(user?.sponserwalletBalance) || 0)} // Dynamic max
//               placeholder={`Max: ₹${
//                 formData.walletType === 'main'
//                   ? finalWithdrawalCap.toFixed(2)
//                   : (Number(user?.sponserwalletBalance) || 0).toFixed(2)
//               }`}
//               className="mt-1 block w-full text-white placeholder-green-200 px-4 py-3 border border-green-600 rounded-lg shadow-inner bg-green-900/60 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-lg no-spinner"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isLoading || currentLevel < 1 || (formData.walletType === 'main' && finalWithdrawalCap <= 0) || (formData.walletType === 'sponser' && (Number(user?.sponserwalletBalance) || 0) <= 0)}
//             className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg font-extrabold text-lg transition-all duration-300 ease-in-out transform
//               ${(currentLevel < 1 || isLoading || (formData.walletType === 'main' && finalWithdrawalCap <= 0) || (formData.walletType === 'sponser' && (Number(user?.sponserwalletBalance) || 0) <= 0))
//                 ? "bg-gray-600 text-gray-300 opacity-80 cursor-not-allowed"
//                 : "bg-gradient-to-r from-yellow-500 to-orange-600 text-purple-900 hover:from-yellow-600 hover:to-orange-700 hover:scale-105 active:scale-95"
//               }`}
//           >
//             {isLoading ? (
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <span className="flex items-center gap-2">
//                 <Banknote size={24} /> Submit Withdraw Request
//               </span>
//             )}
//           </button>
//         </form>

//         <WithdrawHistory />

//       </div>
//     </div>
//   );
// };

// export default Withdraw;
