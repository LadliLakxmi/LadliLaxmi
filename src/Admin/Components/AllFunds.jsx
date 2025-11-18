import React, { useEffect, useState } from "react";
import axios from "axios";

  function formatCreationDate(dateString) {
  if (!dateString) {
    return "N/A";
  }
  const date = new Date(dateString);
  // Using 'en-IN' locale for a common Indian date format (e.g., "25 January 2024")
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const AllFunds = () => {
  const [transactions, setTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For displaying API errors
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search State


  const fetchTransactions = async (page = 1 , search = "") => {
    setLoading(true);
    setErrorMessage("");
  try {
    // ✅ API call ko page aur limit ke sath update karein
      const res = await axios.get(
        `https://ladlilakshmi.onrender.com/api/v1/transactions?page=${page}&limit=30&search=${search}`
      );

    // ✅ Naya data aur pagination state set karein
      setTransactions(res.data.transactions);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
  } catch (err) {
          setErrorMessage("Failed to fetch transactions. Please try again.");
  }finally {
      setLoading(false);
    }
};


  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://ladlilakshmi.onrender.com/api/v1/transaction/${id}/status`, { status: newStatus });
      // ✅ Refresh current page (na ki sab kuch)
      fetchTransactions(currentPage);
    } catch (err) {
 setErrorMessage("Failed to update transaction status. Please try again.");
    }
  };

  useEffect(() => {
    fetchTransactions(1,"");
  }, []);

    // ✅ Handle Search Button Click
  const handleSearch = (e) => {
    e.preventDefault();
    // Jab search karein, to hamesha Page 1 se start karein
    setCurrentPage(1);
    fetchTransactions(1, searchTerm);
  };

  // ✅ Handle Clear Search
  const handleClear = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchTransactions(1, "");
  };


  // ✅ Page change handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTransactions(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchTransactions(currentPage - 1);
    }
  };


  return (
    <div className="p-4  w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">All incoming Funds </h2>

      {/* ✅ SEARCH BAR SECTION */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 items-center flex-wrap">
        <input 
          type="text" 
          placeholder="Search by UTR Number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-400 rounded px-3 py-2 w-full sm:w-64 text-white"
        />
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
        >
          Search
        </button>
        {searchTerm && (
          <button 
            type="button" 
            onClick={handleClear} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
          >
            Clear
          </button>
        )}
      </form>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}

      {/* ✅ Loading indicator */}
      {loading && <p className="text-center">Loading transactions...</p>}

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
              <td className="border p-1">{formatCreationDate(tx.createdAt)}</td>
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

      {/* ✅ PAGINATION BUTTONS */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1 || loading}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default AllFunds;
