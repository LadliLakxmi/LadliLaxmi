import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BankProofAdminPanel = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchAllBankProofs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://ladlilakshmi.onrender.com/api/v1/admin/bank-proofs",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProofs(res.data.proofs || []);
    } catch (err) {
      toast.error("Failed to load bank proofs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      await axios.patch(
        `https://ladlilakshmi.onrender.com/api/v1/admin/user/${userId}/bank-proof-verify`,
        { action }, // "verified" OR "rejected"
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Proof ${action} successfully`);
      fetchAllBankProofs();
    } catch (err) {
      toast.error("Failed to update proof");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllBankProofs();
  }, []);

  return (
    <div className="p-4 md:p-6 text-white">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-2 text-indigo-400">
        🔍 Bank Proof Verification Panel
      </h2>

      {loading ? (
        <p className="text-lg">Fetching bank proofs...</p>
      ) : proofs.length === 0 ? (
        <p className="text-lg text-center">⚠ No bank proofs uploaded yet.</p>
      ) : (
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
                  {/* ✅ Fixed Sequence Number */}
                  <td className="p-4 font-semibold">{index + 1}</td>

                  <td className="p-4 break-words">{proof.email}</td>

                  <td className="p-4 ">
                    <img
                      src={proof.proofUrl}
                      alt="Proof"
                      className="w-full h-40  rounded-lg cursor-pointer object-contain hover:scale-105 duration-200"
                      onClick={() => window.open(proof.proofUrl)}
                    />
                  </td>

                  {/* ✅ Bank Details display */}
                  <td className="p-4 text-xs md:text-sm leading-6">
                    <p><strong>Account Holder:</strong> {proof.bankDetails?.accountHolder || "N/A"}</p>
                    <p><strong>Account Number:</strong> {proof.bankDetails?.accountNumber || "N/A"}</p>
                    <p><strong>Bank Name:</strong> {proof.bankDetails?.bankName || "N/A"}</p>
                    <p><strong>IFSC Code:</strong> {proof.bankDetails?.ifscCode || "N/A"}</p>
                    <p><strong>UPI ID:</strong> {proof.bankDetails?.upiId || "N/A"}</p>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                        proof.bankProofVerified === "verified"
                          ? "bg-green-200 text-green-700"
                          : proof.bankProofVerified === "rejected"
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
                      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-xs font-semibold"
                    >
                      ✅ Approve
                    </button>

                    <button
                      onClick={() => handleAction(proof.userId, "rejected")}
                      className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-xs font-semibold"
                    >
                      ❌ Reject
                    </button>
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

export default BankProofAdminPanel;
