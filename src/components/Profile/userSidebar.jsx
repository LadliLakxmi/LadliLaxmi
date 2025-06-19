import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Logout from "../Auth/Logout";
import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaDonate,
  FaLevelUpAlt,
  FaUsers,
  FaHandshake,
  FaHistory,
  FaGift,
  FaTimes,
  FaBars,
} from "react-icons/fa"; // Importing react-icons for better visuals

const UserSidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  // Define a mapping of labels to icons
  const iconMap = {
    Dashboard: <FaTachometerAlt className="inline-block mr-3 text-gold-400" />,
    Withdraw: <FaMoneyBillWave className="inline-block mr-3 text-green-400" />,
    "Add Fund": <FaMoneyBillWave className="inline-block mr-3 text-green-400" />,
    "Activate Level 1": <FaDonate className="inline-block mr-3 text-purple-400" />,
    Upgrade: <FaLevelUpAlt className="inline-block mr-3 text-indigo-400" />, // Generic for upgrade levels
    "My Downline": <FaUsers className="inline-block mr-3 text-orange-400" />,
    "My Team": <FaHandshake className="inline-block mr-3 text-pink-400" />,
    "Transaction History": <FaHistory className="inline-block mr-3 text-teal-400" />,
    "Donate Downline": <FaGift className="inline-block mr-3 text-red-400" />,
  };

  const links = [
    { to: "/userdashboard/", label: "Dashboard" },
    { to: "/userdashboard/withdraw", label: "Withdraw" },
    ...(user?.currentLevel === 0
      // ? [{ to: "/userdashboard/donatePage", label: "Activate Level 1" }]
            ? [{ to: `/userdashboard/upgrade/${user.currentLevel + 1}`, label: "Activate Account" }]
      : user?.currentLevel < 11
      ? [
          {
            to: `/userdashboard/upgrade/${user.currentLevel + 1}`,
            label: `Give Help to Level ${user.currentLevel + 1}`,
          },
        ]
      : []),
    { to: "/userdashboard/addFund", label: "Add Fund" },
    { to: "/userdashboard/downline", label: "My Downline" },
    { to: "/userdashboard/myteam", label: "My Team" },
        { to: "/userdashboard/Upline", label: "Help To Upline" },
    { to: "/userdashboard/transactions", label: "Transaction History" },
    { to: "/userdashboard/donate", label: "Donate Downline" },
  ].map((link) => ({
    ...link,
   icon: iconMap[link.label.includes("Upgrade") || link.label.includes("Upline") ? "Upgrade" : link.label], // Handle upgrade label generically
}));

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden p-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white flex justify-between items-center shadow-lg fixed top-20 w-full z-50">
        <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
          Welcome, {user?.name}!
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none text-white text-2xl"
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed  top-12 md:top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
          flex flex-col p-6 justify-between overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:h-auto md:shadow-none
          z-40 md:z-auto // Adjusted z-index for mobile to be below header
        `}
      >
        {/* Desktop User Info (hidden on mobile) */}
        <div className="hidden md:block text-center mb-8 border-b border-gray-700 pb-6">
          <h3 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            {user?.name}
          </h3>
          <p className="text-md text-gray-300 flex items-center justify-center">
            <span className="mr-2 text-green-400 font-bold">Level:</span>
            <span className="text-lg font-bold text-yellow-300">
              {user?.currentLevel || 0}
            </span>
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="mb-20 mt-20 md:mt-0 md:mb-0">
          <ul className=" space-y-2">
            {links.map(({ to, label, icon }) => (
              <SidebarLink
                key={to}
                to={to}
                label={label}
                icon={icon}
                onClick={handleClose}
              />
            ))}
          </ul>
        {/* Logout */}
        <div className="px-8 border-t mb-40 md:mb-2 border-gray-700">
          <Logout />
        </div>
        </nav>

      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-60 z-30 md:hidden" // z-30 ensures it's below the sidebar (z-40)
          onClick={handleClose}
        />
      )}
    </>
  );
};

// Reusable Link Component (no changes needed here)
const SidebarLink = ({ to, label, icon, onClick }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-5 py-3 rounded-xl text-lg font-medium transition-all duration-300 ease-in-out
          ${
            isActive
              ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg transform scale-105"
              : "text-gray-200 hover:bg-gray-700 hover:text-white hover:shadow-md"
          }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  </li>
);

export default UserSidebar;
