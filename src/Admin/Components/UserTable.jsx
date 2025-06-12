import React from "react"; // Only React is needed, useState is not used in this snippet

export default function UserTable({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full bg-[#141628] rounded shadow text-white">
        <thead className="bg-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">S.No.</th> {/* Added Sequence Number */}
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Phone</th> {/* Added Phone Number */}
            <th className="py-2 px-4 text-left">Referral Code</th>
            <th className="py-2 px-4 text-left">Level</th> {/* Changed from Status to Level */}
            <th className="py-2 px-4 text-left">Wallet Balance</th>
            {/* Removed Blocked Balance */}
            <th className="py-2 px-4 text-left">Upline</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id} className="border-t hover:bg-gray-800">
              <td className="py-2 px-4">{index + 1}</td> {/* Display Sequence Number */}
              <td className="py-2 px-4">{user?.name || "N/A"}</td>
              <td className="py-2 px-4">{user?.email || "N/A"}</td>
              <td className="py-2 px-4">{user?.phone || "N/A"}</td> {/* Display User Phone */}
              <td className="py-2 px-4">{user?.referralCode || "N/A"}</td>
              <td className="py-2 px-4">L {user?.currentLevel || 0}</td> {/* Display User Level with "L" prefix */}
              <td className="py-2 px-4">₹{user?.walletBalance?.toFixed(2) || "0.00"}</td> {/* Added .toFixed(2) for currency formatting */}
              {/* Removed Blocked Balance row data */}
              <td className="py-2 px-4">{user?.referredBy || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
