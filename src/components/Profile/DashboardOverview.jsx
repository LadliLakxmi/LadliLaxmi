// import React from "react";
// import { ClipboardCopy } from "lucide-react";

// // Define color classes for Tailwind safety
// const colorClasses = {
//   blue: {
//     bg: "bg-blue-50",
//     text: "text-blue-700",
//     value: "text-blue-600",
//   },
//   green: {
//     bg: "bg-green-50",
//     text: "text-green-700",
//     value: "text-green-600",
//   },
//   amber: {
//     bg: "bg-amber-50",
//     text: "text-amber-700",
//     value: "text-amber-600",
//   },
//   red: {
//     bg: "bg-red-50",
//     text: "text-red-700",
//     value: "text-red-600",
//   },
// };

// const InfoCard = ({ title, value, color }) => {
//   const { bg, text, value: valueColor } = colorClasses[color] || colorClasses.blue;

//   return (
//     <div className={`p-6 rounded-lg shadow-md text-center ${bg}`}>
//       <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${text}`}>{title}</h3>
//       <p className={`text-3xl sm:text-4xl font-bold ${valueColor}`}>{value}</p>
//     </div>
//   );
// };

// const DashboardOverview = ({ user ,walletTransactions}) => {
//   console.log(user)
//   if (!user) return null;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(user.referralCode);
//     alert("Referral code copied to clipboard!");
//   };

//   const overviewData = [
//   { title: "Current Level", value: user.currentLevel ?? 0, color: "blue" },
//   { title: "Wallet Balance", value: `₹${(user.walletBalance ?? 0).toFixed(2)}`, color: "green" },
//   { title: "Direct Referrals", value: user.directReferrals?.length ?? 0, color: "blue" },
//   { title: "Matrix Members", value: user.matrixChildren?.length ?? 0, color: "green" },
//   { title: "Total Donations Received", value: user.donationsReceived?.length ?? 0, color: "amber" }, // Corrected line
//   { title: "Total Donations Sent", value: user.donationsSent?.length ?? 0, color: "red" }, // Added optional chaining for consistency
// ];

//   return (
//     <div className="p-4 sm:p-6 lg:p-10 bg-white rounded-2xl shadow-xl w-full max-w-7xl mx-auto">
//       <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
//         Welcome, {user.name?.split(" ")[0] || "User"}
//       </h2>
//       <p className="text-gray-600 text-sm sm:text-base mb-4">{user.email}</p>

//       <div className="flex flex-wrap items-center gap-2 mb-8">
//         <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-lg text-sm sm:text-base">
//           Referral Code: <span className="font-bold">{user.referralCode}</span>
//         </span>
//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//         >
//           <ClipboardCopy size={16} /> Copy
//         </button>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
//         {overviewData.map((item, idx) => (
//           <InfoCard
//             key={idx}
//             title={item.title}
//             value={item.value}
//             color={item.color}
//           />
//         ))}
//       </div>

//       <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-md">
//         <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
//           Recent Activity
//         </h3>
//         {recentTransactions.length === 0 ? (
//           <p className="text-gray-500 italic">No recent activity to display.</p>
//         ) : (
//           <div className="space-y-3">
//             {recentTransactions.map((tx) => (
//               <div
//                 key={tx._id}
//                 className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm text-sm sm:text-base"
//               >
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-800">
//                     {getTransactionTypeDisplay(tx.type)}
//                   </p>
//                   <p className="text-gray-500 text-xs">
//                     {formatDate(tx.createdAt)}
//                   </p>
//                 </div>
//                 <div
//                   className={`font-semibold ${
//                     tx.type?.includes('received') ? 'text-green-600' : 'text-red-600'
//                   }`}
//                 >
//                   ₹{tx.amount?.toFixed(2)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DashboardOverview;
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { ClipboardCopy } from "lucide-react";

// Define color classes for Tailwind safety
const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    value: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    value: "text-green-600",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    value: "text-amber-600",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    value: "text-red-600",
  },
};

const InfoCard = ({ title, value, color }) => {
  const { bg, text, value: valueColor } = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-lg shadow-md text-center ${bg}`}>
      <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${text}`}>{title}</h3>
      <p className={`text-3xl sm:text-4xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
};

// Now DashboardOverview only needs 'user' prop. It will fetch transactions itself.
const DashboardOverview = ({ user }) => {
  console.log(user);

  // State for recent transactions, loading, and error
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  // Utility functions (moved here for DashboardOverview's use)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionTypeDisplay = (type) => {
    if (!type) {
      return 'N/A';
    }
    switch (type) {
      case 'donation_sent':
        return 'Donation Sent';
      case 'donation_received':
        return 'Donation Received';
      // Add other types if your schema expands (e.g., 'deposit', 'withdrawal')
      // case 'deposit':
      //   return 'Deposit';
      // case 'withdrawal':
      //   return 'Withdrawal';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // Fetch recent transactions on component mount or when user changes
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      // Ensure user and user._id are available before fetching
      if (!user || !user._id) {
        setTransactionsLoading(false);
        return;
      }

      setTransactionsLoading(true);
      setTransactionsError(null);
      try {
        // --- UPDATED API CALL ---
        // Now calling the user-specific endpoint with the user's ID
        const response = await fetch(`http://localhost:4001/api/v1/wallet-transactions/user/${user._id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecentTransactions(data.data); // Backend now sends only relevant and sorted data
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
        setTransactionsError("Failed to load recent transactions.");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchRecentTransactions();
  }, [user]); // Re-run effect if user object changes

  if (!user) return null; // Ensure user object is present before rendering anything

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode);
    alert("Referral code copied to clipboard!");
  };

  const overviewData = [
    { title: "Current Level", value: user.currentLevel ?? 0, color: "blue" },
    { title: "Wallet Balance", value: `₹${(user.walletBalance ?? 0).toFixed(2)}`, color: "green" },
    { title: "Direct Referrals", value: user.directReferrals?.length ?? 0, color: "blue" },
    { title: "Matrix Members", value: user.matrixChildren?.length ?? 0, color: "green" },
    // Ensure these properties exist on the user object, or adjust as per your User schema
    { title: "Total Donations Received", value: user.donationsReceived?.length ?? 0, color: "amber" },
    { title: "Total Donations Sent", value: user.donationsSent?.length ?? 0, color: "red" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-white rounded-2xl shadow-xl w-full max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
        Welcome, {user.name?.split(" ")[0] || "User"}
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-4">{user.email}</p>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-lg text-sm sm:text-base">
          Referral Code: <span className="font-bold">{user.referralCode}</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <ClipboardCopy size={16} /> Copy
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {overviewData.map((item, idx) => (
          <InfoCard
            key={idx}
            title={item.title}
            value={item.value}
            color={item.color}
          />
        ))}
      </div>

      <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-md">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
          Recent Activity
        </h3>
        {transactionsLoading ? (
          <p className="text-gray-500 italic text-center">Loading recent activities...</p>
        ) : transactionsError ? (
          <p className="text-red-600 italic text-center">{transactionsError}</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-gray-500 italic text-center">No recent activity to display.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm text-sm sm:text-base"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {getTransactionTypeDisplay(tx.type)}
                    {tx.type === 'donation_sent' && tx.toUser && ` to ${tx.toUser.name || 'User'}`} {/* Optional: display recipient name */}
                    {tx.type === 'donation_received' && tx.fromUser && ` from ${tx.fromUser.name || 'User'}`} {/* Optional: display sender name */}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(tx.createdAt)} - Status: {tx.status}
                  </p>
                  {tx.description && (
                    <p className="text-gray-500 text-xs italic mt-1">{tx.description}</p>
                  )}
                </div>
                <div
                  className={`font-semibold ${
                    tx.type?.includes('received') ? 'text-green-600' : 'text-red-600'
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
