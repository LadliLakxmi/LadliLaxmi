import React from "react"; // Only React is needed, useState is not used in this snippet

export default function UserTable({ users }) {
    // Defensive check: Render a message if users is not an array or is empty.
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-white text-center p-4 bg-[#141628] rounded shadow-md">
        No user data available or data is still loading.
      </div>
    );
  }
  return (
    // This container has `overflow-x-auto` which creates the horizontal scrollbar.
    // It is given `w-full` to occupy the available space.
    // This is the key element that contains the scroll.
    <div className="w-full rounded-md shadow-md overflow-x-auto">
      
      {/* The table inside has `min-w-full` to ensure it can expand beyond its container's width.
          This is what causes the overflow and triggers the scrollbar on the parent div. */}
      <table className="min-w-full bg-[#141628] text-white">
        <thead className="bg-gray-700 sticky ">
          <tr>
            {/* Using `whitespace-nowrap` on headers to prevent text from wrapping,
                which makes the columns wider and forces a scroll */}
            <th className="py-2 px-4 text-left whitespace-nowrap">S.No.</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Name</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Email</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Phone</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Referral Code</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Level</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Wallet Balance</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Upgrade Wallet Balance</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Total Income</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Total Withdrawn</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Upline</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id} className="border-t border-gray-600 hover:bg-gray-800">
              {/* Using `whitespace-nowrap` on data cells as well */}
              <td className="py-2 px-4 whitespace-nowrap">{index + 1}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.name || "N/A"}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.email || "N/A"}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.phone || "N/A"}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.referralCode || "N/A"}</td>
              <td className="py-2 px-4 whitespace-nowrap">L {user?.currentLevel || 0}</td>
              <td className="py-2 px-4 whitespace-nowrap">₹{user?.walletBalance?.toFixed(2) || "0.00"}</td>
              <td className="py-2 px-4 whitespace-nowrap">₹{user?.upgradewalletBalance?.toFixed(2) || "0.00"}</td>
              <td className="py-2 px-4 whitespace-nowrap">₹{user?.totalIncome?.toFixed(2) || "0.00"}</td>
              <td className="py-2 px-4 whitespace-nowrap">₹{user?.totalWithdrawn?.toFixed(2) || "0.00"}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.referredBy || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}