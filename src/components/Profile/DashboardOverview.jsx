import UserTransactions from "./UserTransactions";
import React, { useState, useEffect } from "react";
import { ClipboardCopy } from "lucide-react";
import {
  FaWallet,
  FaUsers,
  FaLevelUpAlt,
  FaHandHoldingUsd,
  FaHandshake,
  FaHistory,
  FaMoneyBillWave, // New icon for Total Income
  FaDollarSign,
  FaSitemap, // New icon for Total Withdrawn
  FaExchangeAlt, // For general transactions if needed
  FaLongArrowAltRight, // For 'sent to'
  FaLongArrowAltLeft, // For 'received from'
} from "react-icons/fa";
import axios from 'axios'; // Assuming you use axios for API calls based on previous context
import UpdateProfileForm from "./UpdateProfileForm";
import ChangePasswordForm from './ChangePasswordForm'; // Import the new component

import { UserCog , Key} from "lucide-react";
import DownlineStatus from "./DownlineStatus";
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
  // Added new colors for total income/withdrawn for distinction
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    text: "text-green-800",
    value: "text-green-700",
    iconColor: "text-green-500",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100",
    text: "text-red-800",
    value: "text-red-700",
    iconColor: "text-red-500",
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
          <Icon size={40} className="-md" />
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
const DashboardOverview = ({ user, setUser,countchild }) => {

  // User prop is already passed and contains the necessary data.
  // console.log("User data in DashboardOverview:", user); // Keep this for debugging if needed

    const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false); // State for modal visibility
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // New state for change password modal

  const BASE_REGISTRATION_URL = "https://www.ladlilakshmi.com/account/"; // Replace with your actual registration page URL
  

  if (!user) return null; // Don't render if user data is not yet available

  const handleCopy = () => {
    const registrationLink = `${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`;
    navigator.clipboard.writeText(registrationLink);
    alert("Registration link with referral code copied to clipboard!");
  };

  // --- ADDED totalIncome and totalWithdrawn to overviewData ---
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
      title: "Upgrade Wallet Balance",
      value: `₹${(user.upgradewalletBalance ?? 0).toFixed(2)}`,
      color: "emerald",
      icon: FaWallet,
    },
    {
      title: "Total Income", // New card
      value: `₹${(user.totalIncome ?? 0).toFixed(2)}`, // Use totalIncome from user prop
      color: "green", // Use new 'green' color
      icon: FaMoneyBillWave, // New icon
    },
    {
      title: "Total Withdrawn", // New card
      value: `₹${(user.totalWithdrawn ?? 0).toFixed(2)}`, // Use totalWithdrawn from user prop
      color: "red", // Use new 'red' color
      icon: FaDollarSign, // New icon
    },
    {
      title: "Direct Referrals",
      value: user.directReferrals?.length ?? 0, // Assuming directReferrals is an array of IDs from backend
      color: "blue",
      icon: FaUsers,
    },
    {
      title: "Matrix Members",
      value: user.matrixChildren?.length ?? 0, // Assuming matrixChildren is an array of IDs from backend
      color: "amber",
      icon: FaHandshake,
    },
    {
      title: "Total Downline Children", // NEW CARD
      value: countchild, // This data needs to come from your backend in the user object
      color: "orange", // New color for this card
      icon: FaSitemap, // New icon
    },
    {
      title: "Donations Received Count", // Renamed for clarity
      value: user.donationsReceived?.length ?? 0, // This is the count of donation documents
      color: "emerald", // Using emerald for received count
      icon: FaHandHoldingUsd,
    },
    {
      title: "Donations Sent Count", // Renamed for clarity
      value: user.donationsSent?.length ?? 0, // This is the count of donation documents
      color: "rose",
      icon: FaHistory,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br mt-8 md:mt-2 from-gray-50 to-gray-200 rounded-3xl shadow-2xl w-full max-w-7xl mx-auto border border-gray-100">

{/* Welcome Section */}
<div className="mb-8 text-center">
  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800 mb-2 drop-shadow-md">
    Welcome, {user.name?.split(" ")[0] || "User"}!
  </h2>

  <div className="flex flex-wrap justify-center gap-2 md:gap-8 text-gray-700 text-md sm:text-lg font-medium">
    <div>Email: {user.email}</div>
    <div>Phone: {user.phone}</div>
    <div>PanCard: {user?.panCard}</div>
  </div>

  <div className="flex gap-4 items-center justify-center mt-6">
    {/* Your other content */}
      <div className="flex gap-4 items-center justify-center">
        {/* --- NEW: Update Profile Button --- */}
        <button
          onClick={() => setShowUpdateProfileModal(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <UserCog size={20} className="mr-2" /> Update Profile
        </button>
        {/* NEW: Change Password Button */}
            <button
                onClick={() => setShowChangePasswordModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
            >
                <Key size={20} className="mr-2" /> Change Password
            </button>
      </div>
  </div>
</div>
{user.currentLevel === 0 && (
<div className="text-red-400 p-4 underline text-2xl rounded-md flex text-center justify-center font-bold mb-6 bg-red-50 border border-red-200">
  Activate your Account to Get your Referral Link
</div>
)}
{user.currentLevel > 0 && (
  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
    <span className="text-lg font-semibold text-center md:text-left">
      Share your referral link and grow your network:
    </span>
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
      <a
        href={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-grow bg-blue-700 px-4 py-2 rounded-lg text-sm sm:text-base font-bold break-words border text-wrap hover:bg-blue-900 transition-colors cursor-pointer text-center"
        title={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
      >
        <span className="block w-full">
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
)}


      {/* Overview Cards */}
      {/* Changed grid layout to provide more space for new cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
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
      <div className="min-h-screen bg-gray-100 p-6">
      <DownlineStatus/>
      <UserTransactions />
    </div>

       {/* --- NEW: Render UpdateProfileForm as a Modal --- */}
      {showUpdateProfileModal && (
        <UpdateProfileForm
          user={user} // Pass the current user data to the form
          onClose={() => setShowUpdateProfileModal(false)} // Function to close the modal
          onProfileUpdated={setUser} // Function to update the user state in Dashboard
        />
      )}

       {/* NEW: Render ChangePasswordForm as a Modal */}
      {showChangePasswordModal && (
        <ChangePasswordForm
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardOverview;
