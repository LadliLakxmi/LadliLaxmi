import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../Components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);

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
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-0 md:p-4 max-w-full">
      <h2 className="text-xl font-bold mb-4 text-white bg-[#141628] p-2 rounded-md shadow-md">
        All Users
      </h2>
      <UserTable users={users} />
    </div>
  );
};

export default Users;
