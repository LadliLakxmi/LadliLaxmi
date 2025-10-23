import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper: Format readable date
function formatCreationDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const AdminWithdrawPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const tableRef = useRef(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch withdrawal requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://ladlilakshmi.onrender.com/api/v1/admin/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(res.data);
      toast.success("Withdrawal requests loaded successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error loading requests.";
      toast.error(errorMessage);
      console.error("Error fetching requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `https://ladlilakshmi.onrender.com/api/v1/withdraw/update/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Request ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update request status.";
      toast.error(errorMessage);
      console.error("Error updating status:", err);
    }
  };

  // 🔍 Filter requests by selected date range
  const filteredRequestsForExport = requests.filter((req) => {
    if (!startDate && !endDate) return true;

    const created = new Date(req.createdAt).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    return (!start || created >= start) && (!end || created <= end);
  });

  if (loading) {
    return (
       <div className="p-6 text-center text-white mt-20">
        <p>Loading withdrawal requests...</p>
        <p>Please wait...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Admin Withdraw Requests
        </h2>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="text-base font-bold text-gray-700 mb-1 transition-all duration-200"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="border border-gray-700 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold rounded-lg px-3 py-2 text-base
      focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 ease-in-out
      hover:border-blue-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="endDate"
              className="text-base font-bold text-gray-700 mb-1 transition-all duration-200"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="border border-gray-700 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold rounded-lg px-3 py-2 text-base
      focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 ease-in-out
      hover:border-blue-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex mt-1 sm:mt-6">
            <DownloadTableExcel
              filename={`withdraw_requests_${new Date().toISOString().split("T")[0]}`}
              sheet="withdrawals"
              currentTableRef={tableRef.current}
            >
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm whitespace-nowrap">
                Download Excel Sheet
              </button>
            </DownloadTableExcel>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {requests.length === 0 ? (
        <p className="text-gray-600">No withdrawal requests found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Amount</th>
                  <th className="py-3 px-6 text-left">Final Amount</th>
                  <th className="py-3 px-6 text-left">IFSC</th>
                  <th className="py-3 px-6 text-left">Account Number</th>
                  <th className="py-3 px-6 text-left">Holder Name</th>
                  <th className="py-3 px-6 text-left">Bank</th>
                  <th className="py-3 px-6 text-left">UPI</th>
                  <th className="py-3 px-6 text-left">Date</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {requests.map((req) => (
                  <tr key={req._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">{req.user?.name || "N/A"}</td>
                    <td className="py-3 px-6">{req.user?.email || "N/A"}</td>
                    <td className="py-3 px-6">
                      ₹{Number(req.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-6">
                      ₹{(Number(req.amount || 0) * 0.9).toFixed(2)}
                    </td>
                    <td className="py-3 px-6">
                      {req.user?.bankDetails?.ifscCode || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {req.user?.bankDetails?.accountNumber || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {req.user?.bankDetails?.accountHolder || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {req.user?.bankDetails?.bankName || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {req.user?.bankDetails?.upiId || "N/A"}
                    </td>
                    <td className="py-3 px-6">
                      {formatCreationDate(req.createdAt)}
                    </td>
                    <td className="py-3 px-6">{req.status || "N/A"}</td>
                    <td className="py-3 px-6 text-center">
                      {req.status === "pending" && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => updateStatus(req._id, "approved")}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(req._id, "rejected")}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md"
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

          {/* Export-only table (hidden) */}
          <table ref={tableRef} style={{ display: "none" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Final Amount</th>
                <th>IFSC</th>
                <th>Account Number</th>
                <th>Holder Name</th>
                <th>Bank</th>
                <th>UPI</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequestsForExport.length > 0 ? (
                filteredRequestsForExport.map((req) => (
                  <tr key={`export-${req._id}`}>
                    <td>{req.user?.name || "N/A"}</td>
                    <td>{req.user?.email || "N/A"}</td>
                    <td>{Number(req.amount || 0).toFixed(2)}</td>
                    <td>{(Number(req.amount || 0) * 0.9).toFixed(2)}</td>
                    <td>{req.user?.bankDetails?.ifscCode || "N/A"}</td>
                    {/* <td>{req.user?.bankDetails?.accountNumber || "N/A"}</td> */}
                    <td>{`\u200B${
                      req.user?.bankDetails?.accountNumber || "N/A"
                    }`}</td>

                    <td>{req.user?.bankDetails?.accountHolder || "N/A"}</td>
                    <td>{req.user?.bankDetails?.bankName || "N/A"}</td>
                    <td>{req.user?.bankDetails?.upiId || "N/A"}</td>
                    <td>{formatCreationDate(req.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11">No data in selected date range</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminWithdrawPanel;
