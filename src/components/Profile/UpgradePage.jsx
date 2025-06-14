import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, DollarSign, ArrowUpCircle } from "lucide-react";
import QRcode from "../../assets/QRcode.jpg";

// Define upgrade levels and their costs (matches backend LEVEL_FLOW.amount)
const LEVELS = {
  1: { upgradeCost: 300 },
  2: { upgradeCost: 500 },
  3: { upgradeCost: 1000 },
  4: { upgradeCost: 2000 },
  5: { upgradeCost: 4000 },
  6: { upgradeCost: 8000 },
  7: { upgradeCost: 16000 },
  8: { upgradeCost: 32000 },
  9: { upgradeCost: 64000 },
  10: { upgradeCost: 128000 },
  11: { upgradeCost: 256000 },
};

// --- IMPORTANT: Assume `fetchUserData` is passed as a prop from a parent component ---
// This function should be responsible for fetching the latest user data from your backend
// and updating the `user` state that is passed down to this component.
const UpgradePage = ({ user, setUser }) => {
  // Added fetchUserData as a prop
  const [loading, setLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Ensure user and its properties are available, provide fallbacks
  const currentLevel = user?.currentLevel ?? 0;
  const walletBalance = user?.walletBalance ?? 0;

  const nextLevel = currentLevel + 1;
  const nextLevelData = LEVELS[nextLevel];
  const upgradeCost = nextLevelData ? nextLevelData.upgradeCost : 0;

  // Conditions for the button state
  const isAtMaxLevel = !nextLevelData;
  const hasInsufficientBalance = walletBalance < upgradeCost;
  const canUpgrade = !isAtMaxLevel && !hasInsufficientBalance;

  const handleUpgrade = async () => {
    // Prevent accidental multiple clicks or calling when not allowed
    if (loading || !canUpgrade) {
      if (isAtMaxLevel) {
        toast.info("You are already at the highest level. Keep earning!");
      } else if (hasInsufficientBalance) {
        toast.error(
          `Wallet balance (₹${walletBalance}) is less than required (₹${upgradeCost}). Please deposit funds.`
        );
      }
      return; // Exit if already loading or cannot upgrade
    }

    setLoading(true); // Disable the button immediately

    try {
      const response = await axios.post(
        "https://ladlilaxmi.onrender.com/api/v1/upgrade",
        {
          userId: user._id,
          level: nextLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data.message ||
          `Congratulations! You've upgraded to Level ${nextLevel}!`
      );
      setSuccessAnimation(true);

      // --- CRITICAL CHANGE: Update user data after successful upgrade ---
      // Call the fetchUserData function passed from the parent.
      // This will re-fetch the latest user data (including updated currentLevel and walletBalance)
      // // and cause the parent component to re-render, thus updating the `user` prop here.
      // if (fetchUserData) {
      //     await fetchUserData();
      // } else {
      //     console.warn("fetchUserData prop not provided to UpgradePage. User data might not update immediately.");
      //     // As a less reliable fallback, you could try to manually update the user state here
      //     // if you manage it directly within this component, but re-fetching is best practice.
      //     // For example: if `user` was a state `const [user, setUser] = useState(...)`
      //     // setUser(prevUser => ({ ...prevUser, currentLevel: nextLevel, walletBalance: prevUser.walletBalance - upgradeCost }));
      //   }
      setUser((prevUser) => ({
        ...prevUser,
        currentLevel: nextLevel,
        walletBalance: prevUser.walletBalance - upgradeCost,
      }));

      // Set a timeout for animation, then navigate
      setTimeout(() => {
        setSuccessAnimation(false); // Hide animation after 3s
        navigate("/"); // Navigate to home/dashboard after the process completes and UI updates
      }, 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred during upgrade.";
      toast.error(errorMessage);
      // Log full error for debugging in the console
      console.error("Upgrade error:", error.response?.data || error.message);
    } finally {
      setLoading(false); // Re-enable the button (whether success or failure)
    }
  };

  // Optional: Use useEffect for debugging to see state changes
  useEffect(() => {
    console.log("UpgradePage current state updated:", {
      currentLevel,
      nextLevel,
      upgradeCost,
      walletBalance,
      isAtMaxLevel,
      hasInsufficientBalance,
      canUpgrade,
      loading,
    });
  }, [
    currentLevel,
    nextLevel,
    upgradeCost,
    walletBalance,
    isAtMaxLevel,
    hasInsufficientBalance,
    canUpgrade,
    loading,
  ]);

  return (
    <div className="flex min-h-[calc(100vh-150px)]  items-center justify-center p-4">
      <div className="bg-gradient-to-br border from-purple-800 to-indigo-900 text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-xl mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-80 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-40 bg-indigo-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

        <h2 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
          <ArrowUpCircle size={36} /> Upgrade Your Level
        </h2>

        {isAtMaxLevel ? (
          <div className="text-center py-8">
            <p className="text-xl text-green-300 font-semibold mb-4 animate-fadeIn">
              🎉 Congratulations! You've reached the Max Level (Level 11)!
            </p>
            <p className="text-gray-300">
              There are no more levels to upgrade. Keep enjoying your earnings!
            </p>
          </div>
        ) : (
          <>
            {user.currentLevel === 0 ? (
              <div className="flex flex-col md:flex-row mt-4  items-center ">
                <div className="flex flex-col w-full items-center">
                  <img
                    className="p-2 h-[25rem] w-[25rem]"
                    src={QRcode}
                    alt=""
                  />
                  <p className="text-4xl mt-0 text-amber-500">
                    ☝🏻 Pay ₹400 
                  </p>
                </div>
                <div className="flex flex-col  text-xl gap-4 p-2 ">
                  <p className="text-red-400 text-2xl ">Instructions-</p>
                  <p>After Payment</p>
                  <p> Please Send Screen Shot on </p>
                  <p className="text-2xl w-full py-4 bg-gray-900 p-2 rounded-2xl">
                    WhatsApp<span className="w-20px">:-</span>{" "}
                    <strong className="text-green-500">+91 78200 09103</strong>{" "}
                  </p>
                  <p className="text-amber-300 ">
                    Along with Name , Email id & Referral code
                  </p>
                  <p>It takes upto 24Hr in your fund addition for</p>
                  <p> Level 1 Activation</p>
                </div>
              </div>
            ) : (
              <div></div>
            )}
                          <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
                  <span className="text-lg font-medium text-purple-200">
                    Next Level:
                  </span>
                  <span className="text-2xl font-bold text-yellow-300">
                    Level {nextLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-indigo-700/50 p-4 rounded-lg">
                  <span className="text-lg font-medium text-indigo-200">
                    Upgrade Cost:
                  </span>
                  <span className="text-2xl font-bold text-green-300 flex items-center">
                    ₹{upgradeCost}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
                  <span className="text-lg font-medium text-purple-200">
                    Your Wallet Balance:
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      hasInsufficientBalance
                        ? "text-red-400"
                        : "text-emerald-300"
                    } flex items-center`}
                  >
                    ₹{walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            {loading ? (
              <button
                disabled
                className="w-full py-3 px-6 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center opacity-70 cursor-not-allowed shadow-inner"
              >
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
                Processing Upgrade...
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={!canUpgrade}
                className={`w-full py-3 px-6 rounded-xl text-white font-extrabold text-lg transition-all duration-300 ease-in-out transform shadow-lg
                                    ${
                                      canUpgrade
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-95"
                                        : "bg-gray-600 opacity-80 cursor-not-allowed"
                                    }`}
              >
                {canUpgrade
                  ? `Confirm Upgrade to Level ${nextLevel}`
                  : "Cannot Upgrade Now"}
              </button>
            )}

            {successAnimation && (
              <div className="flex items-center justify-center mt-6 text-green-300 text-xl font-semibold animate-popIn">
                <CheckCircle2 className="w-12 h-12 mr-3 animate-pulse-green" />
                <span>Upgrade Successful!</span>
              </div>
            )}
          </>
        )}

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
      </div>
    </div>
  );
};

export default UpgradePage;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { CheckCircle2, DollarSign, ArrowUpCircle } from 'lucide-react'; // More relevant icons

// // Define upgrade levels and their costs
// const LEVELS = {
//   1: { upgradeCost: 300 },
//   2: { upgradeCost: 500 },
//   3: { upgradeCost: 1000 },
//   4: { upgradeCost: 2000 },
//   5: { upgradeCost: 4000 },
//   6: { upgradeCost: 8000 },
//   7: { upgradeCost: 16000 },
//   8: { upgradeCost: 32000 },
//   9: { upgradeCost: 64000 },
//   10: { upgradeCost: 128000 },
//   11: { upgradeCost: 256000 },
// };

// const UpgradePage = ({ user }) => {
//   const [loading, setLoading] = useState(false);
//   const [successAnimation, setSuccessAnimation] = useState(false);
//   const token = localStorage.getItem("token");
//    const navigate = useNavigate()
//   // Ensure user and its properties are available, provide fallbacks
//   const currentLevel = user?.currentLevel ?? 0;
//   const walletBalance = user?.walletBalance ?? 0;
//   // const blockedForUpgrade = user?.blockedForUpgrade ?? 0;

//   const nextLevel = currentLevel + 1;
//   const nextLevelData = LEVELS[nextLevel];
//   const upgradeCost = nextLevelData ? nextLevelData.upgradeCost : 0;

//   // Conditions for the button state
//   const isAtMaxLevel = !nextLevelData;
//   const hasInsufficientBalance = walletBalance < upgradeCost;
//   const canUpgrade = !isAtMaxLevel && !hasInsufficientBalance;

//   const handleUpgrade = async () => {
//     if (!canUpgrade) {
//       if (isAtMaxLevel) {
//         toast.info("You are already at the highest level. Keep earning!");
//       } else if (hasInsufficientBalance) {
//         toast.error(`Wallet balance (₹${walletBalance}) is less than required (₹${upgradeCost}). Please deposit funds.`);
//       } 
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post(
//         'https://ladlilaxmi.onrender.com/api/v1/upgrade',
//         {
//           userId: user._id,
//           level: nextLevel,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       toast.success(response.data.message || `Congratulations! You've upgraded to Level ${nextLevel}!`);
//       setSuccessAnimation(true);

//       // You might want to trigger a user data refetch here to update the UI
//       // e.g., if you have a setUser function passed down from a parent component
//       // setUser(prevUser => ({ ...prevUser, currentLevel: nextLevel, walletBalance: prevUser.walletBalance - upgradeCost }));

//       setTimeout(() => {
//         setSuccessAnimation(false); // Hide animation after 3s
//       }, 3000);
//       navigate("/")
//     } catch (error) {
//       const err = error.response?.data?.message || "An unexpected error occurred during upgrade.";
//       toast.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='flex min-h-[calc(100vh-150px)] items-center justify-center p-4'>
//       <div className=" text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
//         {/* Decorative background elements */}
//         <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
//         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

//         <h2 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
//           <ArrowUpCircle size={36} /> Upgrade Your Level
//         </h2>

//         {isAtMaxLevel ? (
//           <div className="text-center py-8">
//             <p className="text-xl text-green-300 font-semibold mb-4 animate-fadeIn">
//               🎉 Congratulations! You've reached the Max Level (Level 11)!
//             </p>
//             <p className="text-gray-300">
//               There are no more levels to upgrade. Keep enjoying your earnings!
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="space-y-4 mb-6">
//               <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
//                 <span className="text-lg font-medium text-purple-200">Next Level:</span>
//                 <span className="text-2xl font-bold text-yellow-300">Level {nextLevel}</span>
//               </div>
//               <div className="flex justify-between items-center bg-indigo-700/50 p-4 rounded-lg">
//                 <span className="text-lg font-medium text-indigo-200">Upgrade Cost:</span>
//                 <span className="text-2xl font-bold text-green-300 flex items-center">
//                   ₹{upgradeCost}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
//                 <span className="text-lg font-medium text-purple-200">Your Wallet Balance:</span>
//                 <span className={`text-xl font-bold ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-300'} flex items-center`}>
//                   ₹{walletBalance.toFixed(2)}
//                 </span>
//               </div>
//               {/* <div className="flex justify-between items-center bg-indigo-700/50 p-4 rounded-lg">
//                 <span className="text-lg font-medium text-indigo-200">Blocked for Upgrade:</span>
//                 <span className={`text-xl font-bold ${hasInsufficientBlockedAmount ? 'text-red-400' : 'text-emerald-300'} flex items-center`}>
//                   ₹{blockedForUpgrade.toFixed(2)}
//                 </span>
//               </div> */}
//             </div>

//             {loading ? (
//               <button
//                 disabled
//                 className="w-full py-3 px-6 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center opacity-70 cursor-not-allowed shadow-inner"
//               >
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing Upgrade...
//               </button>
//             ) : (
//               <button
//                 onClick={handleUpgrade}
//                 disabled={!canUpgrade}
//                 className={`w-full py-3 px-6 rounded-xl text-white font-extrabold text-lg transition-all duration-300 ease-in-out transform shadow-lg
//                   ${canUpgrade
//                     ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-95'
//                     : 'bg-gray-600 opacity-80 cursor-not-allowed'
//                   }`}
//               >
//                 {canUpgrade ? `Confirm Upgrade to Level ${nextLevel}` : 'Cannot Upgrade Now'}
//               </button>
//             )}

//             {successAnimation && (
//               <div className="flex items-center justify-center mt-6 text-green-300 text-xl font-semibold animate-popIn">
//                 <CheckCircle2 className="w-12 h-12 mr-3 animate-pulse-green" />
//                 <span>Upgrade Successful!</span>
//               </div>
//             )}
//           </>
//         )}

//         <ToastContainer
//           position="top-center"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="dark" // Use dark theme for toasts
//         />
//       </div>
//     </div>
//   );
// };

// export default UpgradePage;
