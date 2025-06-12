import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS for styling

const AdminWithdrawPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const token = localStorage.getItem("token");

  // Function to fetch all withdrawal requests
  const fetchRequests = async () => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const res = await axios.get(
        "https://ladlilaxmi.onrender.com/api/v1/admin/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res.data);
      setRequests(res.data);
      toast.success("Withdrawal requests loaded successfully!"); // Show success toast
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error loading requests. Please try again.";
      toast.error(errorMessage); // Show error toast
      console.error("Error fetching requests:", err);
      setRequests([]); // Ensure requests is an empty array on error
    } finally {
      setLoading(false); // Set loading to false when fetching is complete (success or error)
    }
  };

  // Fetch requests on component mount
  useEffect(() => {
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [token]); // Depend on token, although it's unlikely to change often

  // Function to update the status of a withdrawal request
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `https://ladlilaxmi.onrender.com/api/v1/withdraw/update/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Request ${status} successfully!`); // Show success toast
      fetchRequests(); // Re-fetch requests to update the UI
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update request status.";
      toast.error(errorMessage); // Show error toast
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-700">
        <p>Loading withdrawal requests...</p>
        {/* You can add a spinner or loading animation here */}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Withdraw Requests</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-600">No withdrawal requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b border-gray-200">User Email</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Amount</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Status</th>
                <th className="py-3 px-6 text-left border-b border-gray-200">Bank Details</th>
                <th className="py-3 px-6 text-center border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {requests.map((req) => (
                <tr key={req._id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* The critical fix: Safely access req.user.email */}
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {req.user?.email || 'N/A'} {/* Use optional chaining and a fallback */}
                  </td>
                  <td className="py-3 px-6 text-left">
                    ₹{req.amount?.toFixed(2) || '0.00'} {/* Safely display amount */}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                      req.status === "approved" ? "bg-green-200 text-green-800" :
                      req.status === "rejected" ? "bg-red-200 text-red-800" :
                      "bg-yellow-200 text-yellow-800"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {/* Safely display bank details */}
                    {console.log(req.bankDetails)}
                    {req.bankDetails ? (
                      <>
                        <p>Holder: {req.bankDetails.accountHolder || 'N/A'}</p>
                        <p>Acc: {req.bankDetails.accountNumber || 'N/A'}</p>
                        <p>IFSC: {req.bankDetails.ifscCode || 'N/A'}</p>
                        <p>Bank: {req.bankDetails.bankName || 'N/A'}</p>
                        {req.bankDetails.phoneNumber && <p>Phone: {req.bankDetails.phoneNumber}</p>}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {req.status === "pending" && (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => updateStatus(req._id, "approved")}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md transition duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req._id, "rejected")}
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
      )}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  );
};

export default AdminWithdrawPanel;
