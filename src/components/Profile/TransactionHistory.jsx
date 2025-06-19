
import React from 'react'; // Removed useState, useEffect as data is now passed via props
// import { FaUserCircle } from 'react-icons/fa'; // REMOVED: No longer needed

// `walletTransactions` will now be provided directly from the parent,
// and it will contain the populated fromUser and toUser objects.
const TransactionHistory = ({ user, walletTransactions }) => {
  // No internal loading/error states needed here as the parent component
  // (e.g., DashboardOverview) is responsible for fetching the data and handling
  // its loading and error states.

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString(undefined, options);
  };

  const getTransactionTypeDisplay = (type) => {
    if (!type) {
      return 'N/A';
    }
    switch (type) {
      case 'donation_sent': return 'Donation Sent';
      case 'donation_received': return 'Donation Received';
      case 'upgrade_payment_sent': return 'Upgrade Payment Sent';
      case 'upline_upgrade_commission': return 'Upline Upgrade Commission';
      case 'admin_upgrade_revenue': return 'Admin Upgrade Revenue';
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'fund_transfer_sent': return 'Fund Transfer Sent';
      case 'fund_transfer_received': return 'Fund Transfer Received';
      case 'admin': return 'Admin Adjustment';
      case 'sponsor_commission': return 'Sponsor Commission';
      case 'admin_sponsor_share': return 'Admin Sponsor Share';
      case 'withdrawal_approved_sponser_wallet': return "Sponsor Wallet Withdrawal Approved";
      case 'upline_combined_upgrade_commission_and_sponsor_commission': return "Combined Upline Commission";
      case 'admin_combined_upgrade_revenue_and_sponsor_share': return "Combined Admin Revenue";
      case 'upgrade_payment_sent_and_sponsor_share_sent': return "Combined Payment Sent";
      default: return type.replace(/_/g, ' ');
    }
  };

  // If walletTransactions is null/undefined (e.g., during parent loading), show a message
  if (!walletTransactions) {
    return (
      <div className="flex justify-center items-center min-h-screen-content text-xl text-gray-600">
        Awaiting transaction data...
      </div>
    );
  }

  return (
    <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-blue-500">
        Transaction History
      </h2>

      {walletTransactions.length === 0 ? (
        <p className="text-xl text-gray-600 italic text-center py-10">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                {/* CHANGED: From Level to Participants */}
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Participants</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {walletTransactions.map((tx) => {
                // Ensure `user` prop is passed from parent (e.g., DashboardOverview)
                // to correctly determine if current user is sender/receiver.
                const isCurrentUserSender = user && tx.fromUser && tx.fromUser._id === user._id;
                const isCurrentUserReceiver = user && tx.toUser && tx.toUser._id === user._id;

                let participantsDisplay = 'N/A'; // Default display for participants

                // Logic to determine "who paid whom" for the current user
                if (isCurrentUserSender) {
                  // Current user sent money (fromUser is current user)
                  participantsDisplay = (
                    <div className="flex items-center">
                      <span className="text-red-500 mr-1 text-sm">&#x25BC;</span> You sent to{' '}
                      {tx.toUser ? (
                        <span className="ml-1">
                          <strong>{tx.toUser.name || tx.toUser.email || 'Unknown User'}</strong>
                        </span>
                      ) : (
                        // Case for transactions like 'withdrawal' or 'admin_upgrade_revenue' where 'toUser' might be null
                        tx.type === 'withdrawal' || tx.type.includes('admin') ? 'Your Bank / Admin System' : 'Unknown Receiver'
                      )}
                    </div>
                  );
                } else if (isCurrentUserReceiver) {
                  // Current user received money (toUser is current user)
                  participantsDisplay = (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-1 text-sm">&#x25B2;</span> You received from{' '}
                      {tx.fromUser ? (
                        <span className="ml-1">
                          <strong>{tx.fromUser.name || tx.fromUser.email || 'Unknown User'}</strong>
                        </span>
                      ) : (
                        // Case for transactions like 'deposit' where 'fromUser' might be null (e.g., from admin/system)
                        tx.type === 'deposit' || tx.type.includes('admin') ? 'Admin System' : 'Unknown Sender'
                      )}
                    </div>
                  );
                } else {
                  // Fallback for transactions not directly involving the current user as sender/receiver,
                  // or if fromUser/toUser are missing/unhandled for some reason.
                  const senderName = tx.fromUser?.name || tx.fromUser?.email || 'Unknown';
                  const receiverName = tx.toUser?.name || tx.toUser?.email || 'Unknown';

                  participantsDisplay = (
                    <div className="flex items-center">
                      {senderName}
                      <span className="mx-1 text-gray-500">&#x2192;</span> {/* Arrow for "to" */}
                      {receiverName}
                    </div>
                  );
                }

                return (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-base text-gray-800">{formatDate(tx.createdAt)}</td>
                    <td className="py-4 px-6 text-base text-gray-800">{getTransactionTypeDisplay(tx.type)}</td>
                    <td className={`py-4 px-6 text-base font-semibold ${
                      tx.type?.includes('received') || tx.type === 'deposit' || isCurrentUserReceiver ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{tx.amount?.toFixed(2)}
                    </td>
                    {/* Display the new participantsDisplay */}
                    <td className="py-4 px-6 text-base text-gray-800">{participantsDisplay}</td>
                    <td className={`py-4 px-6 text-base font-medium ${
                      tx.status === 'completed' ? 'text-green-500' :
                      tx.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {tx.status}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-800">{tx.description || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;// import React, { useState, useEffect } from 'react';

// const TransactionHistory = ({ user, walletTransactions }) => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (walletTransactions) {
//       setLoading(false);
//       setError(null);
//     } else {
//       setLoading(false);
//       // Optionally set error if no data received
//       // setError("No transaction data available.");
//     }
//   }, [walletTransactions]);

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const getTransactionTypeDisplay = (type) => {
//     if (!type) { // Add this check
//       return 'N/A'; // Or any other suitable default
//     }
//     switch (type) {
//       case 'donation_sent':
//         return 'Donation Sent';
//       case 'donation_received':
//         return 'Donation Received';
//       default:
//         return type.replace(/_/g, ' ');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen-content text-2xl text-blue-600">
//         Loading transactions...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen-content text-2xl text-red-600">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
//       <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-blue-500">
//         Transaction History
//       </h2>

//       {!walletTransactions || walletTransactions.length === 0 ? (
//         <p className="text-xl text-gray-600 italic text-center py-10">No transactions found.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Level</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {walletTransactions.map((tx) => (
//                 <tr key={tx._id} className="hover:bg-gray-50">
//                   <td className="py-4 px-6 text-base text-gray-800">{formatDate(tx.createdAt)}</td>
//                   <td className="py-4 px-6 text-base text-gray-800">{getTransactionTypeDisplay(tx.type)}</td>
//                   <td className={`py-4 px-6 text-base font-semibold ${tx.type?.includes('received') ? 'text-green-600' : 'text-red-600'}`}>
//                     ₹{tx.amount?.toFixed(2)}
//                   </td>
//                   <td className="py-4 px-6 text-base text-gray-800">{tx.donationLevel || 'N/A'}</td>
//                   <td className={`py-4 px-6 text-base font-medium ${
//                     tx.status === 'completed' ? 'text-green-500' :
//                     tx.status === 'pending' ? 'text-yellow-500' :
//                     'text-red-500'
//                   }`}>
//                     {tx.status}
//                   </td>
//                   <td className="py-4 px-6 text-base text-gray-800">{tx.description || 'N/A'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TransactionHistory;
