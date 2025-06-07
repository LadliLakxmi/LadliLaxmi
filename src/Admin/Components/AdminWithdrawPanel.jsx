import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminWithdrawPanel = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  // console.log(token)
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4001/api/v1/admin/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests(res.data);
    } catch (err) {
      setMessage("Error loading requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:4001/api/v1/withdraw/update/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Withdraw Requests</h2>
      {message && <p className="text-sm mb-4">{message}</p>}
      <table className="w-full border">
        <thead>
          <tr>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req._id} className="border-t">
              <td>{req.user.email}</td>
              <td>₹{req.amount}</td>
              <td>{req.status}</td>
              <td>
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(req._id, "approved")}
                      className="bg-green-600 text-white px-2 py-1 mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(req._id, "rejected")}
                      className="bg-red-600 text-white px-2 py-1"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminWithdrawPanel;
