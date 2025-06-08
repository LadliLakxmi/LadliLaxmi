import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { jwtDecode } from "jwt-decode";
import { useToken } from "../hooks/usetoken";
import { FaUserTie, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/Logo.jpeg";
const Navbar = ({ role }) => {
  const navigate = useNavigate();
  const token = useToken();
  const [isOpen, setIsOpen] = useState(false);

  let user = null;
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
    }
  }

  // Set the home path based on role
  const homePath = role === "Admin" ? "/Admindashboard/dashboard" : "home";

  const navItem = [
    { link: "HOME", path: homePath },
    { link: "ABOUT", path: "about" },
    { link: "OUR MISSIONS", path: "missions" },
    { link: "SERVICES", path: "services" },
    { link: "CONTACT", path: "contact" },
    { link: "FAQ", path: "faq" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-[#06091b] border-b-2 border-gray-600 text-amber-100">
      <div className="flex justify-between items-center px-4 py-3 lg:px-8">
        {/* Logo */}
        <div
          className="flex hover:scale-90 items-center space-x-2 cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          {/* <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg> */}

          <img src={Logo} alt="Logo" className="h-14" />

          <p className="text-xl font-semibold">Ladli Lakshmi</p>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-6">
          {navItem.map((item, index) => (
            <li key={index}>
              <ScrollLink
                to={item.path}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                className="cursor-pointer text-lg font-medium hover:text-amber-600 transition"
                onClick={() => {
                  if (item.path.startsWith("/")) {
                    navigate(item.path);
                  } else {
                    navigate("/");
                  }
                }}
              >
                {item.link}
              </ScrollLink>
            </li>
          ))}
        </ul>

        {/* Profile/Login (Desktop) */}
        <div className="hidden lg:flex space-x-4 items-center">
          {role === "Admin" ? (
            <span
              onClick={() => navigate("/Admindashboard/dashboard")}
              className="text-lg cursor-pointer"
            >
              Dashboard
            </span>
          ) : (
            <button
              className="text-lg px-3 py-1 rounded shadow shadow-amber-300 hover:text-amber-600 transition"
              onClick={() => navigate(user ? "/userdashboard" : "/account")}
            >
              {user ? (
                <div className="flex flex-col items-center">
                  <FaUserTie className="w-6 h-6" />
                  <span className="text-sm">Profile</span>
                </div>
              ) : (
                "Register / Login"
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button onClick={toggleMenu}>
            {isOpen ? (
              <FaTimes className="text-2xl text-amber-500" />
            ) : (
              <FaBars className="text-2xl text-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden px-4 pb-4">
          <ul className="flex flex-col space-y-4">
            {navItem.map((item, index) => (
              <li key={index}>
                <ScrollLink
                  to={item.path}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  className="block text-lg font-medium hover:text-amber-500 transition"
                  onClick={() => {
                    if (item.path.startsWith("/")) {
                      navigate(item.path);
                    } else {
                      navigate("/");
                    }
                    setIsOpen(false);
                  }}
                >
                  {item.link}
                </ScrollLink>
              </li>
            ))}
            <li>
              {role === "Admin" ? (
                <span
                  onClick={() => {
                    navigate("/Admindashboard/dashboard");
                    setIsOpen(false);
                  }}
                  className="text-lg cursor-pointer"
                >
                  Dashboard
                </span>
              ) : (
                <button
                  className="text-lg w-full text-left hover:text-amber-600"
                  onClick={() => {
                    navigate(user ? "/userdashboard" : "/account");
                    setIsOpen(false);
                  }}
                >
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <FaUserTie className="w-5 h-5" />
                      <span>Profile</span>
                    </div>
                  ) : (
                    "Register / Login"
                  )}
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
