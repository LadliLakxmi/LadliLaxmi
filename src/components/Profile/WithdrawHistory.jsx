import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { History, IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react'; // Lucide icons for status

const WithdrawHistory = () => {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMyWithdrawRequests = async () => {
      try {
        const response = await axios.get('https://ladlilakshmi.onrender.com/api/v1/withdraw/my-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWithdrawRequests(response.data.requests);
        // ! setReloadWithdrawHistory(prev => !prev);
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch withdrawal history.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyWithdrawRequests();
    } else {
      setLoading(false);
      toast.warn("Please log in to view your withdrawal history.");
    }
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-blue-400" />;
      case 'approved':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-blue-400';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-white">
        <p>Loading withdrawal history...</p>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <History size={28} /> My Withdrawal History
      </h3>
      {withdrawRequests.length === 0 ? (
        <p className="text-gray-300 text-center text-lg mt-8">No withdrawal requests found yet.</p>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {withdrawRequests.map((request) => (
              <li key={request._id} className="p-4 flex items-center justify-between text-white hover:bg-gray-700 transition duration-200">
                <div className="flex items-center gap-3">
                  <IndianRupee size={24} className="text-yellow-400" />
                  <div>
                    <p className="text-lg font-semibold">₹{request.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 font-medium capitalize ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WithdrawHistory;
