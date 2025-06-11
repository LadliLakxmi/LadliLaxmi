import axios from "axios";
import { useState } from "react";

export default function UserTable({ users }) {

  

  // const handleDelete = async (userId) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  //   if (!confirmDelete) return;

  //   try {
  //     await axios.delete(`https://ladlilaxmi.onrender.com/api/v1/admin/deleteUser/${userId}`);
  //     setUsers(prev => prev.filter(user => user._id !== userId));
  //     alert("User deleted successfully");
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //     alert("Failed to delete user");
  //   }
  // };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full bg-[#141628] rounded shadow text-white">
        <thead className="bg-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Referral Code</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Wallet Balance</th>
            <th className="py-2 px-4 text-left">Blocked Balance</th>
            <th className="py-2 px-4 text-left">Upline</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-t hover:bg-gray-800">
              <td className="py-2 px-4">{user?.name || "N/A"}</td>
              <td className="py-2 px-4">{user?.email || "N/A"}</td>
              <td className="py-2 px-4">{user?.referralCode || "N/A"}</td>
              <td className="py-2 px-4">{user?.isActive ? "Active" : "Inactive"}</td>
              <td className="py-2 px-4">₹{user?.walletBalance}</td>
              <td className="py-2 px-4">₹{user?.blockedForUpgrade}</td>
              <td className="py-2 px-4">{user?.referredBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
