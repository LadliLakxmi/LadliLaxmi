import React, { useEffect, useState } from "react";
import axios from "axios";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // JWT token from login
        const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/my-transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading transactions...</p>;
  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">💰 Add Fund Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">UTR No</th>
                <th className="border px-3 py-2">Amount</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={txn._id} className="text-center">
                  <td className="border px-3 py-2">{index + 1}</td>
                  <td className="border px-3 py-2">{txn.UTRno}</td>
                  <td className="border px-3 py-2">₹{txn.amount}</td>
                  <td className="border px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        txn.status === "approved"
                          ? "bg-green-500"
                          : txn.status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {txn.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="border px-3 py-2">
                    {new Date(txn.createdAt).toLocaleDateString()}{" "}
                    {new Date(txn.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserTransactions;
