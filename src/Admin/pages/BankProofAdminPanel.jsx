import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BankProofAdminPanel = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // --- 1. PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(100); // Humara limit 100 par fixed hai

  const fetchAllBankProofs = async (page) => {
    try {
      setLoading(true);
      const res = await axios.get(
        ` https://ladlilakshmi.onrender.com/api/v1/admin/bank-proofs?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend se aaye naye data ko state mein set karein
      console.log("Fetched proofs:", res.data.proofs);
      setProofs(res.data.proofs || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      setTotalDocs(res.data.totalDocs || 0);
    } catch (err) {
      toast.error("Failed to load bank proofs");
      console.error(err);
      if (err.response && err.response.status === 404) {
        setProofs([]); // Agar 404 aaye (e.g., page 1 par data nahi)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      await axios.patch(
        ` https://ladlilakshmi.onrender.com/api/v1/admin/user/${userId}/bank-proof-verify`,
        { action }, // "verified" OR "rejected"
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Proof ${action} successfully`);
      // Action ke baad, *current page* ko hi reload karein
      fetchAllBankProofs(currentPage);
    } catch (err) {
      toast.error("Failed to update proof");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllBankProofs(1);
  }, []);

  // --- 5. PAGINATION HANDLERS ---
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAllBankProofs(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchAllBankProofs(currentPage - 1);
    }
  };

  return (
    <div className="p-4 md:p-6 text-white">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-2 text-indigo-400">
        🔍 Bank Proof Verification Panel
      </h2>

      {loading && proofs.length === 0 ? ( // Initial loading state
        <p className="text-lg">Fetching bank proofs...</p>
      ) : !loading && proofs.length === 0 ? ( // No data state
        <p className="text-lg text-center">⚠ No bank proofs uploaded yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-xl">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-900 text-left text-indigo-300 uppercase ">
                  <th className="p-3">S.No</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Proof</th>
                  <th className="p-3">Bank Details</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {proofs.map((proof, index) => (
                  <tr
                    key={proof.userId}
                    className="border-b border-gray-700 hover:bg-gray-800 transition"
                  >
                    {/* --- 6. FIXED SERIAL NUMBER --- */}
                    <td className="p-4 font-semibold">
                      {(currentPage - 1) * limit + index + 1}
                    </td>

                    <td className="p-4 break-words">{proof.email}</td>

                    <td className="p-4 ">
                      <img
                        src={proof.proofUrl}
                        alt="Proof"
                        className="w-full h-40 rounded-lg cursor-pointer object-contain hover:scale-105 duration-200"
                        onClick={() => window.open(proof.proofUrl)}
                      />
                    </td>

                    <td className="p-4 text-xs md:text-sm leading-6">
                      <p>
                        <strong>Account Holder:</strong>{" "}
                        {proof.bankDetails?.accountHolder || "N/A"}
                      </p>
                      <p>
                        <strong>Account Number:</strong>{" "}
                        {proof.bankDetails?.accountNumber || "N/A"}
                      </p>
                      <p>
                        <strong>Bank Name:</strong>{" "}
                        {proof.bankDetails?.bankName || "N/A"}
                      </p>
                      <p>
                        <strong>IFSC Code:</strong>{" "}
                        {proof.bankDetails?.ifscCode || "N/A"}
                      </p>
                      <p>
                        <strong>UPI ID:</strong>{" "}
                        {proof.bankDetails?.upiId || "N/A"}
                      </p>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-xs ${
                          proof.status === "verified" // 'status' field use karein jo backend se aa raha hai
                            ? "bg-green-200 text-green-700"
                            : proof.status === "rejected"
                            ? "bg-red-200 text-red-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {proof.status}
                      </span>
                    </td>

                    <td className="p-4 text-center flex flex-col justify-center gap-2">
                      <button
                        onClick={() => handleAction(proof.userId, "verified")}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-xs font-semibold disabled:bg-gray-500"
                        disabled={loading || proof.status === "verified"} // Disable if loading or already verified
                      >
                        ✅ Approve
                      </button>

                      <button
                        onClick={() => handleAction(proof.userId, "rejected")}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-xs font-semibold disabled:bg-gray-500"
                        disabled={loading || proof.status === "rejected"} // Disable if loading or already rejected
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- 7. PAGINATION CONTROLS --- */}
          <div className="flex justify-between items-center p-4 bg-gray-900 rounded-b-lg border-t border-gray-700">
            <div>
              <p className="text-sm text-gray-400">
                Page <span className="font-bold text-white">{currentPage}</span>{" "}
                of <span className="font-bold text-white">{totalPages}</span>
                <span className="hidden sm:inline-block ml-2">
                  (Total {totalDocs} records)
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                &larr; Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BankProofAdminPanel;
