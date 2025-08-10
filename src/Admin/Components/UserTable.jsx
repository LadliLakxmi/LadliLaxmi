import React, { useRef } from "react"; 
import { DownloadTableExcel } from "react-export-table-to-excel";

// Define upgrade levels and their costs
const LEVELS = {
  1: { upgradeCost: 400 },
  2: { upgradeCost: 500 },
  3: { upgradeCost: 1000 },
  4: { upgradeCost: 2000 },
  5: { upgradeCost: 4000 },
  6: { upgradeCost: 8000 },
  7: { upgradeCost: 16000 },
  8: { upgradeCost: 32000 },
  9: { upgradeCost: 64000 },
  10: { upgradeCost: 128000 },
  11: { upgradeCost: 256000 },
};

// --- New Helper Function for Date Formatting ---
function formatCreationDate(dateString) {
  if (!dateString) {
    return "N/A";
  }
  const date = new Date(dateString);
  // Using 'en-IN' locale for a common Indian date format (e.g., "25 January 2024")
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
export default function UserTable({ users, onUpgradeClick }) {
    // Defensive check: Render a message if users is not an array or is empty.
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-white text-center p-4 bg-[#141628] rounded shadow-md">
        No user data available or data is still loading... please wait...
      </div>
    );
  }

  const tableRef = useRef(null);
  return (
    <div className="w-full rounded-md shadow-md overflow-x-auto">

      {/* Add the download button here */}
      <div className="flex py-4 ">
        <DownloadTableExcel
          filename="users_table" // The name of the downloaded file
          sheet="users" // The name of the sheet
          currentTableRef={tableRef.current} // Pass the ref to the table
        >
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
            Export to Excel
          </button>
        </DownloadTableExcel>
      </div>


      {/* The table inside has `min-w-full` to ensure it can expand beyond its container's width.
          This is what causes the overflow and triggers the scrollbar on the parent div. */}
      <table className="min-w-full bg-[#141628] text-white" ref={tableRef}>
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
            <th className="py-2 px-4 text-left whitespace-nowrap">Joined On</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Upline</th>
            <th className="py-2 px-4 text-left whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id} className="border-t border-gray-600 hover:bg-gray-800">
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
              <td className="py-2 px-4 whitespace-nowrap">{formatCreationDate(user?.createdAt)}</td>
              <td className="py-2 px-4 whitespace-nowrap">{user?.referredBy || "N/A"}</td>
              <td className="py-2 px-4 whitespace-nowrap">
                {user.currentLevel < 11 ? ( // Only show if not at max level
                  <button
                    onClick={() => onUpgradeClick(user._id, user.currentLevel + 1, user.email)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={user.currentLevel === 11 || user?.upgradewalletBalance < LEVELS[user.currentLevel+1]?.upgradeCost} // Disable if already at max
                  >
                    Upgrade to L {user.currentLevel + 1}
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">Max Level</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}