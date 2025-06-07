import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Logout from "../Auth/Logout";

const UserSidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const links = [
    { to: "/userdashboard/dashboardOverview", label: "Dashboard" },
    { to: "/userdashboard/withdraw", label: "Withdraw" },
    ...(user?.currentLevel === 0
      ? [{ to: "/userdashboard/donatePage", label: "Activate Level 1" }]
      : user?.currentLevel < 11
      ? [
          {
            to: `/userdashboard/upgrade/${user.currentLevel + 1}`,
            label: `Upgrade to Level ${user.currentLevel + 1}`,
          },
        ]
      : []),
    // {to:"/userdashboard/donatePage",label:"Activate/Upgrade Levels"},
    { to: "/userdashboard/downline", label: "My Downline" },
    { to: "/userdashboard/myteam", label: "My Team" },
    { to: "/userdashboard/transactions", label: "Transaction History" },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden p-4  bg-gray-800 text-white flex justify-between items-center">
        <h3 className="text-lg font-bold">Welcome, {user?.name}!</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg  transform transition-transform duration-300
          flex flex-col p-6 justify-evenly
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:top-0 md:h-auto md:shadow-none
        `}
      >
        {/* Desktop User Info */}
        <div className="hidden md:block text-center mb-6 border-b border-gray-700 pb-6">
          <h3 className="text-2xl font-bold mb-1">Welcome, {user?.name}!</h3>
          <p className="text-sm text-gray-400">
            Level: {user?.currentLevel || 0}
          </p>
          <p className="text-xl text-blue-400 font-semibold">
            Balance: ₹{user?.walletBalance?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex ">
          <ul className="space-y-3">
            {links.map(({ to, label }) => (
              <SidebarLink
                key={to}
                to={to}
                label={label}
                onClick={handleClose}
              />
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <Logout />
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
};

// Reusable Sidebar Link
const SidebarLink = ({ to, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-2.5 rounded-lg text-lg transition-colors duration-200 ${
          isActive
            ? "bg-blue-600 text-white font-semibold"
            : "text-gray-200 hover:bg-gray-700 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default UserSidebar;
