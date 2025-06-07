import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle2 } from 'lucide-react';

const LEVELS = {
  1: { upgradeCost: 500 },
  2: { upgradeCost: 1000 },
  3: { upgradeCost: 2000 },
  4: { upgradeCost: 4000 },
  5: { upgradeCost: 8000 },
  6: { upgradeCost: 16000 },
  7: { upgradeCost: 32000 },
  8: { upgradeCost: 64000 },
  9: { upgradeCost: 128000 },
  10: { upgradeCost: 256000 },
  11: { upgradeCost: 512000 },
};

const UpgradePage = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const token = localStorage.getItem("token");

  const nextLevel = user.currentLevel + 1;
  const nextLevelData = LEVELS[nextLevel];

  const handleUpgrade = async () => {
    if (!nextLevelData) {
      toast.info("You are already at the highest level.");
      return;
    }

    const upgradeCost = nextLevelData.upgradeCost;

    if (user.walletBalance < upgradeCost) {
      toast.error(`Insufficient balance. ₹${upgradeCost} needed.`);
      return;
    }

    if (user.blockedForUpgrade < upgradeCost) {
      toast.warning(
        `Blocked amount ₹${user.blockedForUpgrade} is less than ₹${upgradeCost}`
      );
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

      toast.success(response.data.message || "Upgrade successful!");
      setSuccessAnimation(true);

      setTimeout(() => {
        setSuccessAnimation(false); // Hide animation after 3s
      }, 3000);
    } catch (error) {
      const err = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex sm:mt-1 lg:mt-20 items-center justify-center mx-auto w-full'>
      <div className="p-6  w-1/3 mx-auto bg-white rounded shadow flex flex-col justify-center relative">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Upgrade to Level {nextLevel}
      </h2>

      {nextLevelData ? (
        <>
          <p className="text-gray-600 mb-1">Upgrade cost: ₹{nextLevelData.upgradeCost}</p>
          <p className="text-gray-600 mb-1">Wallet balance: ₹{user.walletBalance}</p>
          <p className="text-gray-600 mb-4">Blocked for upgrade: ₹{user.blockedForUpgrade}</p>

          {loading ? (
            <p className="text-blue-500">Processing upgrade...</p>
          ) : (
            <button
              onClick={handleUpgrade}
              className="bg-blue-600 hover:scale-95 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Confirm Upgrade
            </button>
          )}

          {successAnimation && (
            <div className="flex items-center justify-center mt-4 transition-opacity animate-bounce">
              <CheckCircle2 className="text-green-600 w-10 h-10" />
              <span className="text-green-600 ml-2 font-semibold">Upgrade Successful!</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">🎉 You’ve reached the max level (Level 11).</p>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
};

export default UpgradePage;
