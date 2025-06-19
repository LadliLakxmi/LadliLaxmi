
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

// count all  countAllDescendants
const countAllDescendants = (user) => {
  if (!user?.matrixChildren || user.matrixChildren.length === 0) return 0;

  let count = user.matrixChildren.length;
  for (const child of user.matrixChildren) {
    count += countAllDescendants(child); // Recursively add children of each child
  }
  return count;
};

// ---
// DashboardOverview Component (enhanced)
// ---
const DashboardOverview = ({ user, setUser }) => {
 
  // console.log(" users -",user)
  const totalChildCount = countAllDescendants(user); // 🧮 Total child count
  

  // User prop is already passed and contains the necessary data.
  // console.log("User data in DashboardOverview:", user); // Keep this for debugging if needed

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
    const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false); // State for modal visibility
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // New state for change password modal



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
      case "upgrade_payment_sent":
        return "Upgrade Payment Sent";
      case "upline_upgrade_commission":
        return "Upline Upgrade Commission";
      case "admin_upgrade_revenue":
        return "Admin Upgrade Revenue";
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "fund_transfer_sent":
        return "Fund Transfer Sent";
      case "fund_transfer_received":
        return "Fund Transfer Received";
      case "admin":
        return "Admin Adjustment";
      case "sponsor_commission":
        return "Sponsor Commission";
      case "admin_sponsor_share":
        return "Admin Sponsor Share";
      case "withdrawal_approved_sponser_wallet":
        return "Sponsor Wallet Withdrawal Approved";
      case "upline_combined_upgrade_commission_and_sponsor_commission":
        return "Combined Upline Commission";
      case "admin_combined_upgrade_revenue_and_sponsor_share":
        return "Combined Admin Revenue";
      case "upgrade_payment_sent_and_sponsor_share_sent":
        return "Combined Payment Sent";
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
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const response = await axios.get(
          `https://ladlilaxmi.onrender.com/api/v1/wallet-transactions/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the authorization token
            },
          }
        );

        setRecentTransactions(response.data.data); // Axios puts response data in .data
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setTransactionsError("Failed to load recent transactions.");
        // Log more specific error from axios if available
        if (error.response) {
            console.error("API Error Response:", error.response.data);
            console.error("API Error Status:", error.response.status);
            setTransactionsError(error.response.data.message || "Failed to load recent transactions.");
        } else if (error.request) {
            console.error("API No Response:", error.request);
            setTransactionsError("No response from server. Check your network.");
        } else {
            console.error("API Error:", error.message);
            setTransactionsError("An unexpected error occurred.");
        }
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [user]); // Re-fetch when user object changes (e.g., initial load or updates)

  if (!user) return null; // Don't render if user data is not yet available
 const handleProfileUpdated = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };
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
      title: "Sponser Wallet Balance",
      value: `₹${(user.sponserwalletBalance ?? 0).toFixed(2)}`,
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
      value: totalChildCount, // This data needs to come from your backend in the user object
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
        <p className="text-gray-700 text-md sm:text-lg font-medium">
          Email: {user.email}
        </p>
        <p className="text-gray-700 text-md sm:text-lg font-medium">
          Phone: {user.phone}
        </p>
        <p className="text-gray-700 text-md sm:text-lg mb-4 font-medium">
          PanCard: {user?.panCard}
        </p>
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
            {recentTransactions.map((tx) => {
              const isCurrentUserSender = tx.fromUser?._id === user._id;
              const isCurrentUserReceiver = tx.toUser?._id === user._id;

              let transactionDisplay = getTransactionTypeDisplay(tx.type);
              let icon = <FaExchangeAlt className="inline-block mr-2" />; // Default icon

              // Logic for "who paid whom"
              if (tx.type === "donation_sent" || tx.type === "upgrade_payment_sent" || tx.type === "fund_transfer_sent" || tx.type === "combined_payment_sent") {
                if (isCurrentUserSender) {
                  transactionDisplay = (
                    <>
                      <FaLongArrowAltRight className="inline-block mr-2 text-rose-500" />
                      You sent {getTransactionTypeDisplay(tx.type).toLowerCase().replace("sent", "").trim()} to{' '}
                      <strong>{tx.toUser?.name || "Unknown User"}</strong>
                      {tx.toUser?.profilePicture && (
                        <img src={tx.toUser.profilePicture} alt={tx.toUser.name} className="inline-block w-6 h-6 rounded-full ml-1" />
                      )}
                    </>
                  );
                }
              } else if (tx.type === "donation_received" || tx.type === "upline_upgrade_commission" || tx.type === "fund_transfer_received" || tx.type === "sponsor_commission" || tx.type === "upline_combined_upgrade_commission_and_sponsor_commission") {
                if (isCurrentUserReceiver) {
                  transactionDisplay = (
                    <>
                      <FaLongArrowAltLeft className="inline-block mr-2 text-emerald-500" />
                      You received {getTransactionTypeDisplay(tx.type).toLowerCase().replace("received", "").trim()} from{' '}
                      <strong>{tx.fromUser?.name || "Unknown User"}</strong>
                      {tx.fromUser?.profilePicture && (
                        <img src={tx.fromUser.profilePicture} alt={tx.fromUser.name} className="inline-block w-6 h-6 rounded-full ml-1" />
                      )}
                    </>
                  );
                }
              } else if (tx.type === "admin_upgrade_revenue" || tx.type === "admin_sponsor_share" || tx.type === "admin_combined_upgrade_revenue_and_sponsor_share") {
                // These are revenue for the system/admin, usually just say what happened
                transactionDisplay = (
                  <>
                    <FaDollarSign className="inline-block mr-2 text-yellow-500" />
                    {getTransactionTypeDisplay(tx.type)}{' '}
                    {tx.fromUser?.name && `from ${tx.fromUser.name}`}
                    {!tx.fromUser?.name && tx.description && tx.description.includes("from") && (
                      <span className="italic"> ({tx.description.split("from")[1].trim()})</span>
                    )}
                  </>
                );
              } else if (tx.type === "deposit") {
                transactionDisplay = (
                  <>
                    <FaLongArrowAltLeft className="inline-block mr-2 text-emerald-500" />
                    Deposit from system
                  </>
                );
              } else if (tx.type === "withdrawal" || tx.type === "withdrawal_approved_sponser_wallet") {
                transactionDisplay = (
                  <>
                    <FaLongArrowAltRight className="inline-block mr-2 text-rose-500" />
                    Withdrawal to system
                  </>
                );
              }

              return (
                <div
                  key={tx._id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">
                      {transactionDisplay}
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
                      tx.type?.includes("received") || tx.type === "deposit" || (tx.toUser?._id === user._id && !tx.type?.includes("sent"))
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    ₹{tx.amount?.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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




// import React, { useState, useEffect } from "react";
// import { ClipboardCopy } from "lucide-react";
// import {
//   FaWallet,
//   FaChartLine, // You could potentially use this for totalIncome/Withdrawn as well
//   FaUsers,
//   FaLevelUpAlt,
//   FaHandHoldingUsd,
//   FaHandshake,
//   FaHistory,
//   FaMoneyBillWave, // New icon for Total Income
//   FaDollarSign, // New icon for Total Withdrawn
// } from "react-icons/fa"; // Importing react-icons for better visuals
// import axios from 'axios'; // Assuming you use axios for API calls based on previous context
// import UpdateProfileForm from "./UpdateProfileForm";
// import ChangePasswordForm from './ChangePasswordForm'; // Import the new component

// import { UserCog , Key} from "lucide-react";
// // ---
// // Define enhanced color classes for Tailwind safety with a "money" theme
// // ---
// const colorClasses = {
//   emerald: {
//     bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
//     text: "text-emerald-800",
//     value: "text-emerald-700",
//     iconColor: "text-emerald-500",
//   },
//   violet: {
//     bg: "bg-gradient-to-br from-violet-50 to-violet-100",
//     text: "text-violet-800",
//     value: "text-violet-700",
//     iconColor: "text-violet-500",
//   },
//   amber: {
//     bg: "bg-gradient-to-br from-amber-50 to-amber-100",
//     text: "text-amber-800",
//     value: "text-amber-700",
//     iconColor: "text-amber-500",
//   },
//   rose: {
//     bg: "bg-gradient-to-br from-rose-50 to-rose-100",
//     text: "text-rose-800",
//     value: "text-rose-700",
//     iconColor: "text-rose-500",
//   },
//   blue: {
//     bg: "bg-gradient-to-br from-blue-50 to-blue-100",
//     text: "text-blue-800",
//     value: "text-blue-700",
//     iconColor: "text-blue-500",
//   },
//   // Added new colors for total income/withdrawn for distinction
//   green: {
//     bg: "bg-gradient-to-br from-green-50 to-green-100",
//     text: "text-green-800",
//     value: "text-green-700",
//     iconColor: "text-green-500",
//   },
//   red: {
//     bg: "bg-gradient-to-br from-red-50 to-red-100",
//     text: "text-red-800",
//     value: "text-red-700",
//     iconColor: "text-red-500",
//   },
// };

// // ---
// // InfoCard Component (enhanced)
// // ---
// const InfoCard = ({ title, value, color, icon: Icon }) => {
//   const { bg, text, value: valueColor, iconColor } =
//     colorClasses[color] || colorClasses.blue;

//   return (
//     <div
//       className={`p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl ${bg}`}
//     >
//       {Icon && (
//         <div className={`mb-3 ${iconColor}`}>
//           <Icon size={40} className="-md" />
//         </div>
//       )}
//       <h3 className={`text-lg sm:text-xl font-semibold mb-1 ${text}`}>
//         {title}
//       </h3>
//       <p className={`text-3xl sm:text-4xl font-extrabold ${valueColor}`}>
//         {value}
//       </p>
//     </div>
//   );
// };

// // ---
// // DashboardOverview Component (enhanced)
// // ---
// const DashboardOverview = ({ user, setUser }) => {
//   // User prop is already passed and contains the necessary data.
//   // console.log("User data in DashboardOverview:", user); // Keep this for debugging if needed

//   const [recentTransactions, setRecentTransactions] = useState([]);
//   const [transactionsLoading, setTransactionsLoading] = useState(true);
//   const [transactionsError, setTransactionsError] = useState(null);
//     const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false); // State for modal visibility
//     const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // New state for change password modal



//   const formatDate = (dateString) => {
//     const options = {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const BASE_REGISTRATION_URL = "https://www.ladlilakshmi.com/account/"; // Replace with your actual registration page URL

//   const getTransactionTypeDisplay = (type) => {
//     if (!type) {
//       return "N/A";
//     }
//     switch (type) {
//       case "donation_sent":
//         return "Donation Sent";
//       case "donation_received":
//         return "Donation Received";
//       case "withdrawal_request":
//         return "Withdrawal Request";
//       case "withdrawal_completed":
//         return "Withdrawal Completed";
//       case "deposit":
//         return "Deposit";
//       default:
//         return type.replace(/_/g, " ");
//     }
//   };

  
//   useEffect(() => {
//     const fetchRecentTransactions = async () => {
//       if (!user || !user._id) {
//         setTransactionsLoading(false);
//         return;
//       }

//       setTransactionsLoading(true);
//       setTransactionsError(null);
//       try {
//         const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
//         const response = await axios.get(
//           `https://ladlilaxmi.onrender.com/api/v1/wallet-transactions/user/${user._id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`, // Include the authorization token
//             },
//           }
//         );

//         setRecentTransactions(response.data.data); // Axios puts response data in .data
//       } catch (error) {
//         console.error("Error fetching recent transactions:", error);
//         setTransactionsError("Failed to load recent transactions.");
//         // Log more specific error from axios if available
//         if (error.response) {
//             console.error("API Error Response:", error.response.data);
//             console.error("API Error Status:", error.response.status);
//             setTransactionsError(error.response.data.message || "Failed to load recent transactions.");
//         } else if (error.request) {
//             console.error("API No Response:", error.request);
//             setTransactionsError("No response from server. Check your network.");
//         } else {
//             console.error("API Error:", error.message);
//             setTransactionsError("An unexpected error occurred.");
//         }
//       } finally {
//         setTransactionsLoading(false);
//       }
//     };

//     fetchRecentTransactions();
//   }, [user]); // Re-fetch when user object changes (e.g., initial load or updates)

//   if (!user) return null; // Don't render if user data is not yet available
//  const handleProfileUpdated = (updatedUserData) => {
//     setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
//   };
//   const handleCopy = () => {
//     const registrationLink = `${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`;
//     navigator.clipboard.writeText(registrationLink);
//     alert("Registration link with referral code copied to clipboard!");
//   };

//   // --- ADDED totalIncome and totalWithdrawn to overviewData ---
//   const overviewData = [
//     {
//       title: "Current Level",
//       value: user.currentLevel ?? 0,
//       color: "violet",
//       icon: FaLevelUpAlt,
//     },
//     {
//       title: "Wallet Balance",
//       value: `₹${(user.walletBalance ?? 0).toFixed(2)}`,
//       color: "emerald",
//       icon: FaWallet,
//     },
//     {
//       title: "Total Income", // New card
//       value: `₹${(user.totalIncome ?? 0).toFixed(2)}`, // Use totalIncome from user prop
//       color: "green", // Use new 'green' color
//       icon: FaMoneyBillWave, // New icon
//     },
//     {
//       title: "Total Withdrawn", // New card
//       value: `₹${(user.totalWithdrawn ?? 0).toFixed(2)}`, // Use totalWithdrawn from user prop
//       color: "red", // Use new 'red' color
//       icon: FaDollarSign, // New icon
//     },
//     {
//       title: "Direct Referrals",
//       value: user.directReferrals?.length ?? 0, // Assuming directReferrals is an array of IDs from backend
//       color: "blue",
//       icon: FaUsers,
//     },
//     {
//       title: "Matrix Members",
//       value: user.matrixChildren?.length ?? 0, // Assuming matrixChildren is an array of IDs from backend
//       color: "amber",
//       icon: FaHandshake,
//     },
//     {
//       title: "Donations Received Count", // Renamed for clarity
//       value: user.donationsReceived?.length ?? 0, // This is the count of donation documents
//       color: "emerald", // Using emerald for received count
//       icon: FaHandHoldingUsd,
//     },
//     {
//       title: "Donations Sent Count", // Renamed for clarity
//       value: user.donationsSent?.length ?? 0, // This is the count of donation documents
//       color: "rose",
//       icon: FaHistory,
//     },
//   ];

//   return (
//     <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br mt-8 md:mt-2 from-gray-50 to-gray-200 rounded-3xl shadow-2xl w-full max-w-7xl mx-auto border border-gray-100">
//       {/* Welcome Section */}
//       <div className="mb-8 text-center">
//         <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800 mb-2 drop-shadow-md">
//           Welcome, {user.name?.split(" ")[0] || "User"}!
//         </h2>
//         <p className="text-gray-700 text-md sm:text-lg font-medium">
//           Email: {user.email}
//         </p>
//         <p className="text-gray-700 text-md sm:text-lg font-medium">
//           Phone: {user.phone}
//         </p>
//         <p className="text-gray-700 text-md sm:text-lg mb-4 font-medium">
//           PanCard: {user?.panCard}
//         </p>
//       <div className="flex gap-4 items-center justify-center">
//         {/* --- NEW: Update Profile Button --- */}
//         <button
//           onClick={() => setShowUpdateProfileModal(true)}
//           className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
//         >
//           <UserCog size={20} className="mr-2" /> Update Profile
//         </button>
//         {/* NEW: Change Password Button */}
//             <button
//                 onClick={() => setShowChangePasswordModal(true)}
//                 className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
//             >
//                 <Key size={20} className="mr-2" /> Change Password
//             </button>
//       </div>
//       </div>


//       {/* Referral Link Section */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
//         <span className="text-lg font-semibold text-center md:text-left">
//           Share your referral link and grow your network:
//         </span>
//         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
//           <a
//             href={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex-grow bg-blue-700 px-4 py-2 rounded-lg text-sm sm:text-base font-bold break-words border text-wrap hover:bg-blue-900 transition-colors cursor-pointer text-center"
//             title={`${BASE_REGISTRATION_URL}?referralCode=${user.referralCode}`}
//           >
//             <span className="block w-full">
//               {BASE_REGISTRATION_URL}?referralCode={user.referralCode}
//             </span>
//           </a>

//           <button
//             onClick={handleCopy}
//             className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold bg-white text-blue-800 rounded-lg hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 shadow-md"
//           >
//             <ClipboardCopy size={18} /> Copy Link
//           </button>
//         </div>
//       </div>

//       {/* Overview Cards */}
//       {/* Changed grid layout to provide more space for new cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
//         {overviewData.map((item, idx) => (
//           <InfoCard
//             key={idx}
//             title={item.title}
//             value={item.value}
//             color={item.color}
//             icon={item.icon}
//           />
//         ))}
//       </div>

//       {/* Recent Activity Section */}
//       <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
//         <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 border-b pb-3 border-gray-200">
//           Recent Activity
//         </h3>
//         {transactionsLoading ? (
//           <p className="text-gray-500 italic text-center py-8">
//             Loading recent activities...
//           </p>
//         ) : transactionsError ? (
//           <p className="text-red-600 font-semibold text-center py-8">
//             {transactionsError}
//           </p>
//         ) : recentTransactions.length === 0 ? (
//           <p className="text-gray-500 italic text-center py-8">
//             No recent activity to display. Start making transactions!
//           </p>
//         ) : (
//           <div className="space-y-4">
//             {recentTransactions.map((tx) => (
//               <div
//                 key={tx._id}
//                 className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
//               >
//                 <div className="flex-1 mb-2 sm:mb-0">
//                   <p className="font-semibold text-gray-800 text-base sm:text-lg">
//                     {getTransactionTypeDisplay(tx.type)}
//                     {tx.type === "donation_sent" &&
//                       tx.toUser &&
//                       ` to ${tx.toUser.name || "User"}`}
//                     {tx.type === "donation_received" &&
//                       tx.fromUser &&
//                       ` from ${tx.fromUser.name || "User"}`}
//                   </p>
//                   <p className="text-gray-500 text-xs sm:text-sm">
//                     {formatDate(tx.createdAt)}
//                     {tx.status && ` | Status: ${tx.status}`}
//                   </p>
//                   {tx.description && (
//                     <p className="text-gray-600 text-xs italic mt-1">
//                       {tx.description}
//                     </p>
//                   )}
//                 </div>
//                 <div
//                   className={`font-extrabold text-lg sm:text-xl ${
//                     tx.type?.includes("received") || tx.type === "deposit"
//                       ? "text-emerald-600"
//                       : "text-rose-600"
//                   }`}
//                 >
//                   ₹{tx.amount?.toFixed(2)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//        {/* --- NEW: Render UpdateProfileForm as a Modal --- */}
//       {showUpdateProfileModal && (
//         <UpdateProfileForm
//           user={user} // Pass the current user data to the form
//           onClose={() => setShowUpdateProfileModal(false)} // Function to close the modal
//           onProfileUpdated={setUser} // Function to update the user state in Dashboard
//         />
//       )}

//        {/* NEW: Render ChangePasswordForm as a Modal */}
//       {showChangePasswordModal && (
//         <ChangePasswordForm
//           onClose={() => setShowChangePasswordModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default DashboardOverview;
