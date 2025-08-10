import React, { useState, useEffect ,useRef} from 'react';
import axios from "axios";
import { DownloadTableExcel } from "react-export-table-to-excel";

// Assuming you have a CSS file or Tailwind configured for styling
// and a function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return `₹${amount.toFixed(2)}`;
};

const WalletTransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
     const tableRef = useRef(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ define token here
    const response = await axios.get("https://ladlilakshmi.onrender.com/api/v1/admin/getalltransactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
       if (!response.statusText === 'OK') {
          throw new Error('Failed to fetch transactions');
        }
        setTransactions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md shadow-md overflow-x-auto bg-[#141628] text-white p-4">
      {/* Add the download button here */}
            <div className="flex justify-evenly p-2 gap-2">
      <h2 className="text-2xl font-bold mb-4">All Wallet Transactions</h2>
              <DownloadTableExcel
                filename="users_table" // The name of the downloaded file
                sheet="users" // The name of the sheet
                currentTableRef={tableRef.current} // Pass the ref to the table
              >
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                  Export to Excel
                </button>
              </DownloadTableExcel>
            </div>
      {transactions.length === 0 ? (
        <p className="text-center">No transactions available.</p>
      ) : (
        <table className="min-w-full bg-[#141628] "ref={tableRef}>
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left whitespace-nowrap">S.No.</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Amount</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Type</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Status</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">From User</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">To User</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Description</th>
              <th className="py-2 px-4 text-left whitespace-nowrap">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction._id} className="border-t border-gray-600 hover:bg-gray-800">
                <td className="py-2 px-4 whitespace-nowrap">{index + 1}</td>
                <td className="py-2 px-4 whitespace-nowrap">{formatCurrency(transaction.amount)}</td>
                <td className="py-2 px-4 whitespace-nowrap">{transaction.type}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    transaction.status === 'completed' ? 'bg-green-500' :
                    transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {transaction.fromUser ? `${transaction.fromUser.name} (${transaction.fromUser.email})` : 'N/A'}
                </td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {transaction.toUser ? `${transaction.toUser.name} (${transaction.toUser.email})` : 'N/A'}
                </td>
                <td className="py-2 px-4">{transaction.description || 'N/A'}</td>
                <td className="py-2 px-4 whitespace-nowrap">{new Date(transaction.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WalletTransactionsTable;