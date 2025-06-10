import React, { useState, useEffect } from "react";
import { ClipboardCopy } from "lucide-react";
import {
  FaWallet,
  FaChartLine,
  FaUsers,
  FaLevelUpAlt,
  FaHandHoldingUsd,
  FaHandshake,
  FaHistory,
} from "react-icons/fa"; // Importing react-icons for better visuals

// ---
// Define enhanced color classes for Tailwind safety with a "money" theme
// ---
const colorClasses = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    text: "text-emerald-800",
    value: "text-emerald-700",
    iconColor: "text-emerald-500",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-50 to-violet-100",
    text: "text-violet-800",
    value: "text-violet-700",
    iconColor: "text-violet-500",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    text: "text-amber-800",
    value: "text-amber-700",
    iconColor: "text-amber-500",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50 to-rose-100",
    text: "text-rose-800",
    value: "text-rose-700",
    iconColor: "text-rose-500",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    text: "text-blue-800",
    value: "text-blue-700",
    iconColor: "text-blue-500",
  },
};

// ---
// InfoCard Component (enhanced)
// ---
const InfoCard = ({ title, value, color, icon: Icon }) => {
  const { bg, text, value: valueColor, iconColor } =
    colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl ${bg}`}
    >
      {Icon && (
        <div className={`mb-3 ${iconColor}`}>
          <Icon size={40} className="drop-shadow-md" />
        </div>
      )}
      <h3 className={`text-lg sm:text-xl font-semibold mb-1 ${text}`}>
        {title}
      </h3>
      <p className={`text-3xl sm:text-4xl font-extrabold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
};

// ---
// DashboardOverview Component (enhanced)
// ---
const DashboardOverview = ({ user }) => {
  console.log(user);

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const BASE_REGISTRATION_URL = "https://www.ladlilakshmi.com/account/"; // Replace with your actual registration page URL

  const getTransactionTypeDisplay = (type) => {
    if (!type) {
      return "N/A";
    }
    switch (type) {
      case "donation_sent":
        return "Donation Sent";
      case "donation_received":
        return "Donation Received";
      default:
        return type.replace(/_/g, " ");
    }
  };

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!user || !user._id) {
        setTransactionsLoading(false);
        return;
      }

      setTransactionsLoading(true);
      setTransactionsError(null);
      try {
        const response = await fetch(
          `http://localhost:4001/api/v1/wallet-transactions/user/${user._id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecentTransactions(data.data);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setTransactionsError("Failed to load recent transactions.");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [user]);

  if (!user) return null;

  const handleCopy = () => {
    const registrationLink = `${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`;
    navigator.clipboard.writeText(registrationLink);
    alert("Registration link with referral code copied to clipboard!");
  };

  const overviewData = [
    {
      title: "Current Level",
      value: user.currentLevel ?? 0,
      color: "violet",
      icon: FaLevelUpAlt,
    },
    {
      title: "Wallet Balance",
      value: `₹${(user.walletBalance ?? 0).toFixed(2)}`,
      color: "emerald",
      icon: FaWallet,
    },
    {
      title: "Direct Referrals",
      value: user.directReferrals?.length ?? 0,
      color: "blue",
      icon: FaUsers,
    },
    {
      title: "Matrix Members",
      value: user.matrixChildren?.length ?? 0,
      color: "amber",
      icon: FaHandshake,
    },
    {
      title: "Total Donations Received",
      value: user.donationsReceived?.length ?? 0,
      color: "emerald",
      icon: FaHandHoldingUsd,
    },
    {
      title: "Total Donations Sent",
      value: user.donationsSent?.length ?? 0,
      color: "rose",
      icon: FaHistory,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl shadow-2xl w-full max-w-7xl mx-auto border border-gray-100">
      {/* Welcome Section */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800 mb-2 drop-shadow-md">
          Welcome, {user.name?.split(" ")[0] || "User"}!
        </h2>
        <p className="text-gray-700 text-md sm:text-lg mb-4 font-medium">
          {user.email}
        </p>
      </div>

      {/* Referral Link Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-lg font-semibold text-center md:text-left">
          Share your referral link and grow your network:
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-grow bg-blue-700 px-4 py-2 rounded-lg text-sm sm:text-base font-bold truncate hover:bg-blue-900 transition-colors cursor-pointer text-center"
            title={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
          >
            <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {BASE_REGISTRATION_URL}?referralCode={user.referralCode}
            </span>
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold bg-white text-blue-800 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <ClipboardCopy size={18} /> Copy Link
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {overviewData.map((item, idx) => (
          <InfoCard
            key={idx}
            title={item.title}
            value={item.value}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
          Recent Activity
        </h3>
        {transactionsLoading ? (
          <p className="text-gray-500 italic text-center py-8">
            Loading recent activities...
          </p>
        ) : transactionsError ? (
          <p className="text-red-600 font-semibold text-center py-8">
            {transactionsError}
          </p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-gray-500 italic text-center py-8">
            No recent activity to display. Start making transactions!
          </p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1 mb-2 sm:mb-0">
                  <p className="font-semibold text-gray-800 text-base sm:text-lg">
                    {getTransactionTypeDisplay(tx.type)}
                    {tx.type === "donation_sent" &&
                      tx.toUser &&
                      ` to ${tx.toUser.name || "User"}`}
                    {tx.type === "donation_received" &&
                      tx.fromUser &&
                      ` from ${tx.fromUser.name || "User"}`}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {formatDate(tx.createdAt)}
                    {tx.status && ` | Status: ${tx.status}`}
                  </p>
                  {tx.description && (
                    <p className="text-gray-600 text-xs italic mt-1">
                      {tx.description}
                    </p>
                  )}
                </div>
                <div
                  className={`font-extrabold text-lg sm:text-xl ${
                    tx.type?.includes("received")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  ₹{tx.amount?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
