import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle2, DollarSign, ArrowUpCircle } from 'lucide-react'; // More relevant icons

// Define upgrade levels and their costs
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

const UpgradePage = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const token = localStorage.getItem("token");

  // Ensure user and its properties are available, provide fallbacks
  const currentLevel = user?.currentLevel ?? 0;
  const walletBalance = user?.walletBalance ?? 0;
  const blockedForUpgrade = user?.blockedForUpgrade ?? 0;

  const nextLevel = currentLevel + 1;
  const nextLevelData = LEVELS[nextLevel];
  const upgradeCost = nextLevelData ? nextLevelData.upgradeCost : 0;

  // Conditions for the button state
  const isAtMaxLevel = !nextLevelData;
  const hasInsufficientBalance = walletBalance < upgradeCost;
  const hasInsufficientBlockedAmount = blockedForUpgrade < upgradeCost;
  const canUpgrade = !isAtMaxLevel && !hasInsufficientBalance && !hasInsufficientBlockedAmount;

  const handleUpgrade = async () => {
    if (!canUpgrade) {
      if (isAtMaxLevel) {
        toast.info("You are already at the highest level. Keep earning!");
      } else if (hasInsufficientBalance) {
        toast.error(`Wallet balance (₹${walletBalance}) is less than required (₹${upgradeCost}). Please deposit funds.`);
      } else if (hasInsufficientBlockedAmount) {
        toast.warning(`Blocked amount (₹${blockedForUpgrade}) is less than required (₹${upgradeCost}). Please ensure sufficient blocked funds.`);
      }
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:4001/api/v1/upgrade',
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

      toast.success(response.data.message || `Congratulations! You've upgraded to Level ${nextLevel}!`);
      setSuccessAnimation(true);

      // You might want to trigger a user data refetch here to update the UI
      // e.g., if you have a setUser function passed down from a parent component
      // setUser(prevUser => ({ ...prevUser, currentLevel: nextLevel, walletBalance: prevUser.walletBalance - upgradeCost }));

      setTimeout(() => {
        setSuccessAnimation(false); // Hide animation after 3s
      }, 3000);
    } catch (error) {
      const err = error.response?.data?.message || "An unexpected error occurred during upgrade.";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-150px)] items-center justify-center p-4'>
      <div className=" text-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

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
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
                <span className="text-lg font-medium text-purple-200">Next Level:</span>
                <span className="text-2xl font-bold text-yellow-300">Level {nextLevel}</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-700/50 p-4 rounded-lg">
                <span className="text-lg font-medium text-indigo-200">Upgrade Cost:</span>
                <span className="text-2xl font-bold text-green-300 flex items-center">
                  ₹{upgradeCost}
                </span>
              </div>
              <div className="flex justify-between items-center bg-purple-700/50 p-4 rounded-lg">
                <span className="text-lg font-medium text-purple-200">Your Wallet Balance:</span>
                <span className={`text-xl font-bold ${hasInsufficientBalance ? 'text-red-400' : 'text-emerald-300'} flex items-center`}>
                  ₹{walletBalance.toFixed(2)}
                </span>
              </div>
              {/* <div className="flex justify-between items-center bg-indigo-700/50 p-4 rounded-lg">
                <span className="text-lg font-medium text-indigo-200">Blocked for Upgrade:</span>
                <span className={`text-xl font-bold ${hasInsufficientBlockedAmount ? 'text-red-400' : 'text-emerald-300'} flex items-center`}>
                  ₹{blockedForUpgrade.toFixed(2)}
                </span>
              </div> */}
            </div>

            {loading ? (
              <button
                disabled
                className="w-full py-3 px-6 rounded-xl bg-purple-600 text-white font-bold text-lg flex items-center justify-center opacity-70 cursor-not-allowed shadow-inner"
              >
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Upgrade...
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={!canUpgrade}
                className={`w-full py-3 px-6 rounded-xl text-white font-extrabold text-lg transition-all duration-300 ease-in-out transform shadow-lg
                  ${canUpgrade
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-95'
                    : 'bg-gray-600 opacity-80 cursor-not-allowed'
                  }`}
              >
                {canUpgrade ? `Confirm Upgrade to Level ${nextLevel}` : 'Cannot Upgrade Now'}
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
          theme="dark" // Use dark theme for toasts
        />
      </div>
    </div>
  );
};

export default UpgradePage;
