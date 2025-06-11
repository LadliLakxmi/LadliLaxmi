import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IndianRupee, Wallet, PiggyBank, Banknote, Landmark } from 'lucide-react'; // Lucide icons

// Centralized configuration for levels, including withdrawal limits and next upgrade costs
const LEVEL_CONFIG = {
  1: { withdrawLimit: 0, nextUpgradeCost: 300 }, // Level 1 might not have a withdraw limit, but has a next upgrade cost for Level 2
  2: { withdrawLimit: 100, nextUpgradeCost: 500 },
  3: { withdrawLimit: 1000, nextUpgradeCost: 1000 },
  4: { withdrawLimit: 6000, nextUpgradeCost: 2000 },
  5: { withdrawLimit: 28000, nextUpgradeCost: 4000 },
  6: { withdrawLimit: 120000, nextUpgradeCost: 8000 },
  7: { withdrawLimit: 496000, nextUpgradeCost: 16000 },
  8: { withdrawLimit: 2016000, nextUpgradeCost: 32000 },
  9: { withdrawLimit: 8128000, nextUpgradeCost: 64000 },
  10: { withdrawLimit: 32640000, nextUpgradeCost: 128000 },
  11: { withdrawLimit: 130816000, nextUpgradeCost: 0 }, // Level 11 has no further upgrade cost
};

const Withdraw = ({ user }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    phoneNumber: "", // Added phone number
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false); // For button loading state

  const token = localStorage.getItem("token");

  // Get user's current level (default to 0 if undefined)
  const currentLevel = user?.currentLevel || 0;

  // Get configuration for the CURRENT level
  const currentLevelConfig = LEVEL_CONFIG[currentLevel] || { withdrawLimit: 0, nextUpgradeCost: 0 };
  const maxAllowedForLevel = currentLevelConfig.withdrawLimit;

  // Get the upgrade cost for the NEXT level
  const nextLevelUpgradeCost = LEVEL_CONFIG[currentLevel + 1]?.nextUpgradeCost || 0;

  // Calculate truly available balance for withdrawal
  // This is where we combine walletBalance with the *potential* need for the next upgrade.
  // The user's walletBalance is effectively reduced by the nextUpgradeCost for withdrawal purposes
  // if they haven't yet reached that level's requirement.
  const availableForWithdrawBeforeLimit = Math.max(
    (user?.walletBalance || 0) - nextLevelUpgradeCost, // Deduct next upgrade cost from available balance
    0
  );

  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0); // State for already withdrawn amount

  // Remaining withdrawal limit for the current level
  const remainingLimitForLevel = Math.max(maxAllowedForLevel - alreadyWithdrawn, 0);

  // The final limit is the minimum of (balance - next upgrade cost) and (remaining limit for current level)
  const finalWithdrawalCap = Math.min(availableForWithdrawBeforeLimit, remainingLimitForLevel);


  useEffect(() => {
    // If bank details are present, set them and also initialize form data for consistency
    if (user?.bankDetails) {
      setBankDetails(user.bankDetails);
      setFormData((prev) => ({
        ...prev,
        accountHolder: user.bankDetails.accountHolder || "",
        accountNumber: user.bankDetails.accountNumber || "",
        ifscCode: user.bankDetails.ifscCode || "",
        bankName: user.bankDetails.bankName || "",
        phoneNumber: user.bankDetails.phoneNumber || "",
      }));
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
        toast.error("Failed to load withdrawal summary.");
      }
    };

    fetchWithdrawn();
  }, [user, token]); // user and token as dependencies

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

    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount to withdraw.");
      setIsLoading(false);
      return;
    }

    // Use the final calculated cap for validation
    if (amount > finalWithdrawalCap) {
      toast.error(
        `Withdrawal amount exceeds your current limit. You can only withdraw up to ₹${finalWithdrawalCap.toFixed(2)}.`
      );
      setIsLoading(false);
      return;
    }

    // Client-side validation for bank details if they are being entered for the first time
    if (!bankDetails) {
      if (!formData.accountHolder || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.phoneNumber) {
        toast.error("Please fill in all bank details and your phone number.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const payload = {
        amount,
        // Only send bankDetails if they are not already saved
        ...(bankDetails
          ? {} // If bank details exist, don't send them in the withdrawal request
          : {
              bankDetails: {
                accountHolder: formData.accountHolder,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                bankName: formData.bankName,
                phoneNumber: formData.phoneNumber, // Include phone number here
              },
            }),
      };

      await axios.post("https://ladlilaxmi.onrender.com/api/v1/withdraw/request", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Withdraw request submitted successfully! It will be processed shortly.");
      setFormData((prev) => ({ ...prev, amount: "" }));
      // Optionally re-fetch withdrawn amount to update remaining limit
      // or simply update the state locally if your backend confirms the deduction
      setAlreadyWithdrawn(prev => prev + amount); // Optimistic update
      // A full re-fetch might be safer if backend logic is complex: fetchWithdrawn();
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error(err.response?.data?.message || "An error occurred while sending your withdraw request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-150px)] items-center justify-center p-4'>
      <div className="bg-gradient-to-br from-green-800 to-emerald-900 text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

        <h2 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500  flex items-center justify-center gap-3">
          <Banknote size={36} /> Withdraw Your Earnings
        </h2>

        {/* Current Balances & Limits Section */}
        <div className="bg-green-700/50 border border-green-600 rounded-lg p-4 mb-6 text-base text-green-100 shadow-md">
          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold flex items-center"><Wallet size={20} className="mr-2" />Total Wallet Balance:</span>
            <span className="font-bold text-yellow-300">₹{user?.walletBalance?.toFixed(2) || "0.00"}</span>
          </p>
          {nextLevelUpgradeCost > 0 && (
            <p className="flex justify-between items-center mb-2">
              <span className="font-semibold flex items-center"><PiggyBank size={20} className="mr-2" />Next Upgrade Reserved:</span>
              <span className="font-bold text-orange-200">₹{nextLevelUpgradeCost.toFixed(2)}</span>
            </p>
          )}

          <hr className="my-3 border-green-600" />

          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold flex items-center">Available for Withdrawal:</span>
            <span className="font-bold text-emerald-300">₹{availableForWithdrawBeforeLimit.toFixed(2)}</span>
          </p>

          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold">Your Current Level:</span>
            <span className="font-bold">{currentLevel > 0 ? `Level ${currentLevel}` : "Not Upgraded"}</span>
          </p>
          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold">Level Max Withdraw Limit:</span>
            <span className="font-bold">₹{maxAllowedForLevel.toFixed(2)}</span>
          </p>
          <p className="flex justify-between items-center mb-2">
            <span className="font-semibold">Already Withdrawn (This Level):</span>
            <span className="font-bold">₹{alreadyWithdrawn.toFixed(2)}</span>
          </p>
          <p className="flex justify-between items-center border-t border-green-600 pt-3 mt-3 font-bold text-lg text-yellow-100">
            <span>Final Withdrawal Cap:</span>
            <span>₹{finalWithdrawalCap.toFixed(2)}</span>
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
                { label: "Account Holder Name", name: "accountHolder", type: "text" },
                { label: "Account Number", name: "accountNumber", type: "text" },
                { label: "IFSC Code", name: "ifscCode", type: "text" },
                { label: "Bank Name", name: "bankName", type: "text" },
                { label: "Phone Number", name: "phoneNumber", type: "tel" }, // Changed to 'tel' for phone number input
              ].map((field) => (
                <div key={field.name} className="mb-4 last:mb-0">
                  <label htmlFor={field.name} className="block text-sm font-medium text-green-100 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
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
              <p className="mb-2"><strong>Account Holder:</strong> {bankDetails.accountHolder}</p>
              <p className="mb-2"><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
              <p className="mb-2"><strong>IFSC Code:</strong> {bankDetails.ifscCode}</p>
              <p className="mb-2"><strong>Bank Name:</strong> {bankDetails.bankName}</p>
              {bankDetails.phoneNumber && (
                <p className="mb-2"><strong>Phone Number:</strong> {bankDetails.phoneNumber}</p>
              )}
              <p className="mt-4 text-xs text-yellow-200 opacity-80">
                To update your bank details, please contact customer support for security reasons.
              </p>
            </div>
          )}

          {/* Withdraw Amount Input */}
          <div className="mt-8">
            <label htmlFor="amount" className="block text-lg font-medium text-yellow-300 mb-2 flex items-center gap-2">
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
              max={finalWithdrawalCap}
              placeholder={`Max: ₹${finalWithdrawalCap.toFixed(2)}`}
              className="mt-1 block w-full text-white placeholder-green-200 px-4 py-3 border border-green-600 rounded-lg shadow-inner bg-green-900/60 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-lg no-spinner"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || currentLevel < 1 || finalWithdrawalCap <= 0}
            className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-lg font-extrabold text-lg transition-all duration-300 ease-in-out transform
              ${currentLevel < 1 || isLoading || finalWithdrawalCap <= 0
                ? "bg-gray-600 text-gray-300 opacity-80 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-500 to-orange-600 text-purple-900 hover:from-yellow-600 hover:to-orange-700 hover:scale-105 active:scale-95"
              }`}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center gap-2">
                <Banknote size={24} /> Submit Withdraw Request
              </span>
            )}
          </button>
        </form>

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
          theme="dark" // Use dark theme for toasts
        />
      </div>
    </div>
  );
};

export default Withdraw;

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// // Moved to a more structured object to avoid duplicate keys and clarify purpose
// const LEVEL_CONFIG = {
//   1: { withdrawLimit: 0, nextUpgradeCost: 300 }, // Level 1 might not have a withdraw limit, but has a next upgrade cost for Level 2
//   2: { withdrawLimit: 100, nextUpgradeCost: 500 },
//   3: { withdrawLimit: 1000, nextUpgradeCost: 1000 },
//   4: { withdrawLimit: 6000, nextUpgradeCost: 2000 },
//   5: { withdrawLimit: 28000, nextUpgradeCost: 4000 },
//   6: { withdrawLimit: 120000, nextUpgradeCost: 8000 }, // Corrected based on your LEVEL_FLOW for next level
//   7: { withdrawLimit: 496000, nextUpgradeCost: 16000 },
//   8: { withdrawLimit: 2016000, nextUpgradeCost: 32000 },
//   9: { withdrawLimit: 8128000, nextUpgradeCost: 64000 },
//   10: { withdrawLimit: 32640000, nextUpgradeCost: 128000 }, // Adjusted based on LEVEL_FLOW netIncome for the level
//   11: { withdrawLimit: 130816000, nextUpgradeCost: 256000 }, // Level 11 has no further upgrade cost
// };

// const Withdraw = ({ user }) => {
//   const [bankDetails, setBankDetails] = useState(null);
//   const [formData, setFormData] = useState({
//     accountHolder: "",
//     accountNumber: "",
//     ifscCode: "",
//     bankName: "",
//     phoneNumber: "",
//     amount: "",
//   });
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // 'success' or 'error'
//   const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0);
//   const [isLoading, setIsLoading] = useState(false); // For button loading state

//   const token = localStorage.getItem("token");

//   // Get user's current level (default to 0 if undefined)
//   const currentLevel = user?.currentLevel || 0;

//   // Get configuration for the CURRENT level
//   const currentLevelConfig = LEVEL_CONFIG[currentLevel] || { withdrawLimit: 0, nextUpgradeCost: 0 };
//   const maxAllowedForLevel = currentLevelConfig.withdrawLimit;

//   // Get the upgrade cost for the NEXT level
//   const nextLevelUpgradeCost = LEVEL_CONFIG[currentLevel + 1]?.nextUpgradeCost || 0;

//   // Calculate truly available balance for withdrawal
//   // This is where we combine walletBalance with the *potential* need for the next upgrade.
//   // The user's walletBalance is effectively reduced by the nextUpgradeCost for withdrawal purposes
//   // if they haven't yet reached that level's requirement.
//   const availableForWithdrawBeforeLimit = Math.max(
//     (user?.walletBalance || 0) - nextLevelUpgradeCost, // Deduct next upgrade cost from available balance
//     0
//   );

//   // Remaining withdrawal limit for the current level
//   const remainingLimitForLevel = Math.max(maxAllowedForLevel - alreadyWithdrawn, 0);

//   // The final limit is the minimum of (balance - next upgrade cost) and (remaining limit for current level)
//   const finalWithdrawalCap = Math.min(availableForWithdrawBeforeLimit, remainingLimitForLevel);


//   useEffect(() => {
//     // If bank details are present, set them and also initialize form data for consistency
//     if (user?.bankDetails) {
//       setBankDetails(user.bankDetails);
//       setFormData((prev) => ({
//         ...prev,
//         accountHolder: user.bankDetails.accountHolder || "",
//         accountNumber: user.bankDetails.accountNumber || "",
//         ifscCode: user.bankDetails.ifscCode || "",
//         bankName: user.bankDetails.bankName || "",
//         // Ensure phoneNumber is correctly pulled from bankDetails if it exists
//         phoneNumber: user.bankDetails.phoneNumber || "",
//       }));
//     }

//     const fetchWithdrawn = async () => {
//       try {
//         const res = await axios.get("https://ladlilaxmi.onrender.com/api/v1/withdraw/summary", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         // The `alreadyWithdrawn` should be tracked against the current level's limit.
//         // You might need your backend to provide `alreadyWithdrawn` specifically *for the current level*.
//         // If your backend only returns total withdrawn, you'd need to adjust here or in the backend.
//         setAlreadyWithdrawn(res.data.alreadyWithdrawn || 0);
//       } catch (err) {
//         console.error("Failed to fetch withdrawn amount", err);
//         setMessage("Failed to load withdrawal summary.");
//         setMessageType("error");
//       }
//     };

//     fetchWithdrawn();
//   }, [user, token]); // user and token as dependencies

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleWithdraw = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setMessageType("");
//     setIsLoading(true);

//     if (currentLevel < 1) {
//       setMessage("Please upgrade to Level 1 before withdrawing.");
//       setMessageType("error");
//       setIsLoading(false);
//       return;
//     }

//     const amount = Number(formData.amount);

//     if (!amount || amount <= 0) {
//       setMessage("Please enter a valid amount.");
//       setMessageType("error");
//       setIsLoading(false);
//       return;
//     }

//     // Use the final calculated cap for validation
//     if (amount > finalWithdrawalCap) {
//       setMessage(
//         `Withdrawal amount exceeds your current limit. You can only withdraw up to ₹${finalWithdrawalCap.toFixed(2)}.`
//       );
//       setMessageType("error");
//       setIsLoading(false);
//       return;
//     }

//     // Client-side validation for phone number if bank details are being entered for the first time
//     if (!bankDetails) { // Only require these if bank details are being added/updated
//       if (!formData.accountHolder || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.phoneNumber) {
//         setMessage("Please fill in all bank details and phone number.");
//         setMessageType("error");
//         setIsLoading(false);
//         return;
//       }
//     }


//     try {
//       const payload = {
//         amount,
//         // Only send bankDetails if they are not already saved
//         ...(bankDetails
//           ? {} // If bank details exist, don't send them in the withdrawal request
//           : {
//               bankDetails: {
//                 accountHolder: formData.accountHolder,
//                 accountNumber: formData.accountNumber,
//                 ifscCode: formData.ifscCode,
//                 bankName: formData.bankName,
//                 phoneNumber: formData.phoneNumber, // Include phone number here
//               },
//             }),
//       };

//       await axios.post("http://localhost:4001/api/v1/withdraw/request", payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setMessage("Withdraw request sent successfully!");
//       setMessageType("success");
//       setFormData((prev) => ({ ...prev, amount: "" }));
//       // Consider re-fetching user data or wallet balance after successful withdrawal
//       // to update the available balance display in real-time.
//       // E.g., a prop function like `onWithdrawSuccess()` passed from parent.
//     } catch (err) {
//       console.error("Withdrawal error:", err);
//       setMessage(err.response?.data?.message || "Error sending withdraw request.");
//       setMessageType("error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex w-full items-center justify-center mx-auto px-4 sm:px-6 lg:px-8">
//       <div className=" w-full lg:w-[60%] bg-gray-50 shadow-xl rounded-lg p-6 sm:p-8 border border-gray-200">
//         <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-8">
//           <i className="fas fa-wallet mr-2 text-blue-600"></i>Withdraw Funds
//         </h2>

//         {/* Current Balances & Limits Section */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
//           <p className="flex justify-between items-center mb-1">
//             <span className="font-semibold">Total Wallet Balance:</span>
//             <span>₹{user?.walletBalance?.toFixed(2) || "0.00"}</span>
//           </p>
//           {/* Display next upgrade cost as a consideration, but not "blocked" funds */}
//           {nextLevelUpgradeCost > 0 && (
//             <p className="flex justify-between items-center mb-1 text-blue-700">
//               <span className="font-semibold">Next Level Upgrade Cost (Level {currentLevel + 1}):</span>
//               <span>₹{nextLevelUpgradeCost.toFixed(2)}</span>
//             </p>
//           )}

//           {/* Remove blockedForUpgrade display since it's an internal calculation now */}
//           {/* <p className="flex justify-between items-center mb-1">
//             <span className="font-semibold">Blocked for Upgrade:</span>
//             <span>₹{user?.blockedForUpgrade?.toFixed(2) || "0.00"}</span>
//           </p> */}

//           <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-base">
//             <span>Effective Balance for Withdrawal:</span>
//             <span>₹{availableForWithdrawBeforeLimit.toFixed(2)}</span>
//           </p>
//           <hr className="my-3 border-blue-200" />
//           <p className="flex justify-between items-center mb-1">
//             <span className="font-semibold">Your Current Level:</span>
//             <span>{currentLevel > 0 ? `Level ${currentLevel}` : "Not Upgraded"}</span>
//           </p>
//           <p className="flex justify-between items-center mb-1">
//             <span className="font-semibold">Current Level Max Withdraw Limit:</span>
//             <span>₹{maxAllowedForLevel.toFixed(2)}</span>
//           </p>
//           <p className="flex justify-between items-center mb-1">
//             <span className="font-semibold">Already Withdrawn (Current Level):</span>
//             <span>₹{alreadyWithdrawn.toFixed(2)}</span>
//           </p>
//           <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-base">
//             <span>Remaining Withdrawal Limit for Level:</span>
//             <span>₹{remainingLimitForLevel.toFixed(2)}</span>
//           </p>
//           <p className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2 font-bold text-lg text-green-700">
//             <span>Final Withdrawal Amount Cap:</span>
//             <span>₹{finalWithdrawalCap.toFixed(2)}</span>
//           </p>
//         </div>

//         <form onSubmit={handleWithdraw} className="space-y-6">
//           {/* Bank Details Section (Conditional) */}
//           {!bankDetails ? (
//             <div className="grid grid-cols-1 gap-4">
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Bank Details</h3>
//               {["accountHolder", "accountNumber", "ifscCode", "bankName", "phoneNumber"].map((field) => (
//                 <div key={field}>
//                   <label htmlFor={field} className="block text-sm font-medium text-black mb-1">
//                     {field === "accountHolder" ? "Account Holder Name" :
//                      field === "accountNumber" ? "Account Number" :
//                      field === "ifscCode" ? "IFSC Code" :
//                      field === "bankName" ? "Bank Name" :
//                      "Phone Number"}
//                   </label>
//                   <input
//                     type={field === "phoneNumber" ? "tel" : "text"}
//                     id={field}
//                     name={field}
//                     value={formData[field]}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-gray-500"
//                     placeholder={`Enter ${
//                       field === "accountHolder" ? "Account Holder Name" :
//                       field === "accountNumber" ? "Account Number" :
//                       field === "ifscCode" ? "IFSC Code" :
//                       field === "bankName" ? "Bank Name" :
//                       "Phone Number"
//                     }`}
//                   />
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Saved Bank Details:</h3>
//               <p>
//                 <strong>Account Holder:</strong> {bankDetails.accountHolder}
//               </p>
//               <p>
//                 <strong>Account Number:</strong> {bankDetails.accountNumber}
//               </p>
//               <p>
//                 <strong>IFSC Code:</strong> {bankDetails.ifscCode}
//               </p>
//               <p>
//                 <strong>Bank Name:</strong> {bankDetails.bankName}
//               </p>
//               {bankDetails.phoneNumber && ( // Only display if phone number exists
//                 <p>
//                   <strong>Phone Number:</strong> {bankDetails.phoneNumber}
//                 </p>
//               )}
//               <p className="mt-2 text-xs text-black">
//                 To update bank details, please contact support.
//               </p>
//             </div>
//           )}

//           {/* Withdraw Amount Input */}
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-black mb-1">
//               Withdraw Amount (₹)
//             </label>
//             <input
//               type="number"
//               id="amount"
//               name="amount"
//               value={formData.amount}
//               onChange={handleChange}
//               required
//               min={1}
//               max={finalWithdrawalCap}
//               placeholder={`Maximum: ₹${finalWithdrawalCap.toFixed(2)}`}
//               className="mt-1 block w-full text-black placeholder-gray-500 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm no-spinner"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isLoading || currentLevel < 1 || finalWithdrawalCap <= 0}
//             className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
//               ${currentLevel < 1 || isLoading || finalWithdrawalCap <= 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               }`}
//           >
//             {isLoading ? (
//               <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <i className="fas fa-paper-plane mr-2"></i>
//             )}
//             {isLoading ? "Sending Request..." : "Submit Withdraw Request"}
//           </button>
//         </form>

//         {/* Message Display */}
//         {message && (
//           <div
//             className={`mt-6 p-3 rounded-md text-sm font-medium text-center
//               ${messageType === "success"
//                 ? "bg-green-100 text-green-800 border border-green-200"
//                 : "bg-red-100 text-red-800 border border-red-200"
//               }`}
//             role="alert"
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Withdraw;
