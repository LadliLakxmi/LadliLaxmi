import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../Components/UserTable";
import Swal from "sweetalert2";

const USERS_PER_PAGE = 200;

const Users = () => {
  const [usersCache, setUsersCache] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(1); // Local input state
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync pageInput with currentPage when changed by buttons or code
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  // Fetch users (with optional search)
  const fetchUsers = async (page, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = search
        ? { search, limit: USERS_PER_PAGE }
        : { page, limit: USERS_PER_PAGE };

      const res = await axios.get(
        "https://ladlilakshmi.onrender.com/api/v1/admin/getalluser",
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && Array.isArray(res.data.users)) {
        if (search) {
          setSearchResults(res.data.users);
        } else {
          setUsersCache((prev) => ({ ...prev, [page]: res.data.users }));
          if (res.data.totalCount) {
            setTotalPages(Math.ceil(res.data.totalCount / USERS_PER_PAGE));
          }
        }
      } else {
        if (search) setSearchResults([]);
        else setUsersCache((prev) => ({ ...prev, [page]: [] }));
      }
    } catch (err) {
      Swal.fire("Error", "Failed to fetch users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Upgrade
  const handleUpgrade = async (userId, nextLevel, userEmail) => {
    const result = await Swal.fire({
      title: "Confirm Upgrade?",
      html: `Are you sure you want to manually upgrade <strong>${userEmail}</strong> to <strong>Level ${nextLevel}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, upgrade!",
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "https://ladlilakshmi.onrender.com/api/v1/upgrade",
          { userId, level: nextLevel },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          Swal.fire(
            "Upgraded!",
            res.data.message ||
              `User ${userEmail} has been upgraded to Level ${res.data.newLevel}.`,
            "success"
          );
          fetchUsers(currentPage); // refresh current page
        } else {
          Swal.fire(
            "Upgrade Failed!",
            res.data.message || "Something went wrong.",
            "error"
          );
        }
      } catch (err) {
        Swal.fire(
          "Upgrade Error!",
          err.response?.data?.message ||
            "An error occurred during the upgrade.",
          "error"
        );
      }
    }
  };

  // Fetch users when page changes or search term updates
  useEffect(() => {
    if (searchTerm.trim()) {
      const delay = setTimeout(() => fetchUsers(1, searchTerm), 500);
      return () => clearTimeout(delay);
    } else {
      fetchUsers(currentPage);
    }
  }, [searchTerm, currentPage]);

  const displayedUsers =
    searchTerm.trim() !== "" ? searchResults : usersCache[currentPage] || [];

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
        <div className="text-white text-center p-4 bg-[#141628] rounded shadow-md">
          Loading users...
        </div>
      ) : (
        <UserTable
          users={displayedUsers}
          currentPage={currentPage}
          pageSize={USERS_PER_PAGE}
          onUpgradeClick={handleUpgrade}
        />
      )}

      {/* Pagination Controls */}
      {!searchTerm && (
        <div className="pagination-controls mt-4 flex gap-2 justify-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            First
          </button>

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Previous
          </button>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={pageInput}
            onChange={(e) => {
              setPageInput(e.target.value); // Reflect typed value
            }}
            onBlur={(e) => {
              const page = Number(e.target.value);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setPageInput(page);
              } else {
                setPageInput(currentPage);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const page = Number(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page);
                  setPageInput(page);
                } else {
                  setPageInput(currentPage);
                }
              }
            }}
            className="
              w-20
              text-center
              bg-[#202336]
              text-white
              border
              border-gray-600
              rounded-md
              px-2
              py-1
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              transition
              duration-200
              ease-in-out
              appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
            "
          />

          <span className="flex items-center text-white">/ {totalPages}</span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Next
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
