import { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../Components/UserTable";

const Users = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token"); // ✅ define token here
    const res = await axios.get("http://localhost:4001/api/v1/admin/getalluser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(res.data || []);
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white bg-[#141628] p-2 rounded-md shadow-md">
        All Users
      </h2>
      <UserTable users={users} />
    </div>
  );
};

export default Users;
