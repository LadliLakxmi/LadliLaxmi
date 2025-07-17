import React, { useEffect, useState } from "react";
import axios from "axios";

const AllFunds = () => {
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For displaying API errors

  const fetchTransactions = async () => {
  try {
    const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/transactions");
    const sorted = res.data.transactions.sort((a, b) => {
      // Priority: pending > approved
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;

      // Within same status, latest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setTransactions(sorted);
  } catch (err) {
          setErrorMessage("Failed to fetch transactions. Please try again.");
  }
};


  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://ladlilakshmi.onrender.com/api/v1/transaction/${id}/status`, { status: newStatus });
      fetchTransactions(); // Refresh list
    } catch (err) {
 setErrorMessage("Failed to update transaction status. Please try again.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-4  w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">All incoming Funds </h2>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Email</th>
            <th className="border px-2">Referral Code</th>
            <th className="border px-2">Amount</th>
            <th className="border px-2">UTR No</th>
            <th className="border px-2">Date</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="text-center">
              <td className="border p-1">{tx.name}</td>
              <td className="border p-1">{tx.email}</td>
              <td className="border p-1">{tx.Referalcode}</td>
              <td className="border p-1">{tx.amount}</td>
              <td className="border p-1">{tx.UTRno}</td>
              <td className="border p-1">{tx.createdAt}</td>
              <td className={`border p-1 ${tx.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>{tx.status}</td>
              <td className="border p-1">
                {tx.status === "pending" && (
                  <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => updateStatus(tx._id, "approved")}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(tx._id, "rejected")}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllFunds;
