import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../Components/UserTable";
import Swal from 'sweetalert2'; // For elegant confirmation and alerts



const Users = () => {
  const [users, setUsers] = useState([]);
   const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [loading, setLoading] = useState(true); // New state for loading indicator


  const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token"); // ✅ define token here
    const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/admin/getalluser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // --- 🚨 The fix is here! ---
      // Check if the response data contains a 'users' array
      if (res.data && Array.isArray(res.data.users)) {
        // Set the state to the array inside the 'users' key
        setUsers(res.data.users);
      } else {
        // Handle cases where the data structure is not as expected
        console.error("API response is not in the expected format:", res.data);
        setUsers([]); // Reset to an empty array to prevent errors
      }
  } catch (err) {
    console.error("Failed to fetch users:", err);
    Swal.fire('Error', 'Failed to fetch users. Please try again.', 'error'); 
  
  }finally {
      setLoading(false); // Set loading to false after fetch (success or failure)
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
          // "http://localhost:4001/api/v1/upgrade",
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
    fetchUsers();
  }, []);

    // --- CORRECTED: Filtered Users Logic ---
  const filteredUsers = searchTerm === ""
    ? users // If search term is empty, show all users
    : users.filter(user => { // Otherwise, apply the filter
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
          (user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (user.email && user.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (user.referralCode && user.referralCode.toLowerCase().includes(lowerCaseSearchTerm))
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

      {/* <UserTable users={filteredUsers} onUpgradeClick={handleUpgrade}/> */}
      {/* User Table */}
      {loading ? (
        <div className="text-white text-center p-4 bg-[#141628] rounded shadow-md">Loading users...</div>
      ) : (
        <UserTable users={filteredUsers} onUpgradeClick={handleUpgrade} />
      )}
    </div>
  );
};

export default Users;
