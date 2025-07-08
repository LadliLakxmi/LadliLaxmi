import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TransferSponsorToMain = ({ user }) => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Set userId from props when component mounts or user changes
  useEffect(() => {
    if (user && user._id) {
      setUserId(user._id);
    }
  }, [user]);
  const navigate = useNavigate();

  const handleTransfer = async () => {
    if (!userId || !amount || isNaN(amount) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount.");
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `https://ladlilakshmi.onrender.com/api/v1/wallet-transactions/transferToMain/${userId}`,
        {
          amount: Number(amount),
        }
      );
      alert(response.data.message);

      toast.success(response.data.message);
      setAmount("");
      navigate("/")
    } catch (error) {
      const message =
        error.response?.data?.error || "Transfer failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">
        Upgrade Wallet Transfer
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Enter Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to transfer"
          className="w-full text-black px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <button
        onClick={handleTransfer}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
      >
        {loading ? "Transferring..." : "Transfer"}
      </button>
    </div>
  );
};

export default TransferSponsorToMain;
