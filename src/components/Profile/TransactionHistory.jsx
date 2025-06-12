import React, { useState, useEffect } from 'react';

const TransactionHistory = ({ user, walletTransactions }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (walletTransactions) {
      setLoading(false);
      setError(null);
    } else {
      setLoading(false);
      // Optionally set error if no data received
      // setError("No transaction data available.");
    }
  }, [walletTransactions]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionTypeDisplay = (type) => {
    if (!type) { // Add this check
      return 'N/A'; // Or any other suitable default
    }
    switch (type) {
      case 'donation_sent':
        return 'Donation Sent';
      case 'donation_received':
        return 'Donation Received';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content text-2xl text-blue-600">
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen-content text-2xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-blue-500">
        Transaction History
      </h2>

      {!walletTransactions || walletTransactions.length === 0 ? (
        <p className="text-xl text-gray-600 italic text-center py-10">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {walletTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-base text-gray-800">{formatDate(tx.createdAt)}</td>
                  <td className="py-4 px-6 text-base text-gray-800">{getTransactionTypeDisplay(tx.type)}</td>
                  <td className={`py-4 px-6 text-base font-semibold ${tx.type?.includes('received') ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{tx.amount?.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-base text-gray-800">{tx.donationLevel || 'N/A'}</td>
                  <td className={`py-4 px-6 text-base font-medium ${
                    tx.status === 'completed' ? 'text-green-500' :
                    tx.status === 'pending' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {tx.status}
                  </td>
                  <td className="py-4 px-6 text-base text-gray-800">{tx.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
