import React, { useEffect, useState } from "react";
import axios from "axios";

const AllFunds = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
  try {
    const res = await axios.get("http://localhost:4001/api/v1/transactions");
    const sorted = res.data.transactions.sort((a, b) => {
      // Priority: pending > approved
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;

      // Within same status, latest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setTransactions(sorted);
  } catch (err) {
    console.error("Error fetching transactions", err);
  }
};


  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:4001/api/v1/transaction/${id}/status`, { status: newStatus });
      fetchTransactions(); // Refresh list
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-4  max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">All incoming Funds </h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="border px-2">Name</th>
            <th className="border px-2">Email</th>
            <th className="border px-2">Referral Code</th>
            <th className="border px-2">Amount</th>
            <th className="border px-2">UTR No</th>
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
              <td className={`border p-1 ${tx.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>{tx.status}</td>
              <td className="border p-1">
                {tx.status === "pending" && (
                  <button
                    onClick={() => updateStatus(tx._id, "approved")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
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
