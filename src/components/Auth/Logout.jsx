// Logout.js (Separate Component)
import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4001/api/v1/auth/logout", {
        method: "POST", // Or POST
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.ok) {
        // Remove token from cookies
        Cookies.remove("cookie");

        // Remove token from local storage
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
        // Redirect to home page after logout
        navigate("/");
        window.location.reload();

        console.log("Logout successful");
      } else {
        const data = await response.json();
        console.error("Logout failed:", data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className=" border-t border-gray-700 px-2 p-1 text-xl shadow-2xl shadow-amber-900 bg-red-600 rounded-md mb-2 text-white font-semibold transition-transform duration-200 hover:scale-90 active:scale-120"
    >
      Logout
    </button>
  );
};

export default Logout;
