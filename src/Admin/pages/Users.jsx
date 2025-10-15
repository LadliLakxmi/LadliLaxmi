import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../Components/UserTable";
import Swal from 'sweetalert2';

const USERS_PER_PAGE = 200;

const Users = () => {
  const [usersCache, setUsersCache] = useState({}); // pageNumber -> [users]
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async (page) => {
    if (usersCache[page]) return; // Already fetched

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://ladlilakshmi.onrender.com/api/v1/admin/getalluser",
        {
          params: { page, limit: USERS_PER_PAGE },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && Array.isArray(res.data.users)) {
        setUsersCache((prev) => ({ ...prev, [page]: res.data.users }));
        // Calculate total pages if totalCount is available
        if (res.data.totalCount) {
          setTotalPages(Math.ceil(res.data.totalCount / USERS_PER_PAGE));
        }
      } else {
        setUsersCache((prev) => ({ ...prev, [page]: [] }));
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- New: handleUpgrade Function ---
  const handleUpgrade = async (userId, nextLevel, userEmail) => {
    // 1. Confirmation Dialog
    const result = await Swal.fire({
      title: 'Confirm Upgrade?',
      html: `Are you sure you want to manually upgrade <strong>${userEmail}</strong> to <strong>Level ${nextLevel}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, upgrade!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "https://ladlilakshmi.onrender.com/api/v1/upgrade",
        {
          userId: userId,
          level: nextLevel,
        }, // Only send userId, nextLevel is calculated on backend
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          Swal.fire(
            'Upgraded!',
            res.data.message || `User ${userEmail} has been upgraded to Level ${res.data.newLevel}.`,
            'success'
          );
          fetchUsers(); // Refresh the user list to show the updated level
        } else {
          Swal.fire(
            'Upgrade Failed!',
            res.data || 'Something went wrong during the upgrade.',
            'error'
          );
        }
      } catch (err) {
        console.error("Error upgrading user:", err);
        let errorMessage = 'An error occurred during the upgrade.';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        Swal.fire(
          'Upgrade Error!',
          errorMessage,
          'error'
        );
      }
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Filtered users for display
  const filteredUsers = searchTerm === ""
    ? (usersCache[currentPage] || [])
    : (usersCache[currentPage] || []).filter(user => {
        const term = searchTerm.toLowerCase();
        return (
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.referralCode && user.referralCode.toLowerCase().includes(term))
        );
      });

  return (
    <div className="p-0 md:p-4 max-w-full">
      <h2 className="text-xl font-bold mb-4 text-white bg-[#141628] p-2 rounded-md shadow-md">
        All Users
      </h2>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name, Email, or Referral Code..."
          className="p-2 border border-gray-600 rounded-md w-full bg-[#202336] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table */}
      {loading ? (
        <div className="text-white text-center p-4 bg-[#141628] rounded shadow-md">Loading users...</div>
      ) : (
        <UserTable
          users={filteredUsers}
          currentPage={currentPage}
          pageSize={USERS_PER_PAGE}
          onUpgradeClick={handleUpgrade} 
        />
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls mt-4 flex gap-2 justify-center">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Previous
        </button>
        <span className="flex items-center text-white">
          Page {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;
