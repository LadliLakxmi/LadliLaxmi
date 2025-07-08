import React, { useEffect, useState } from "react"
import UserSidebar from "../components/Profile/userSidebar";
import axios from "axios";
import Main from "../components/Profile/main";
import './Profile.css'; // We'll create this CSS file for the animation

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          // Using localhost for development, ensure it's correct for your setup
          `https://ladlilaxmi.onrender.com/api/v1/profile/getprofile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(data.data.profile);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Optionally, set an error state here to display a message to the user
      }
    };
    if (userId) fetchData();
  }, [userId, token]); // Added token to dependency array for completeness

  // --- Animated Loader ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loader-container flex flex-col">
          <div className="loader-container">
          <span className="currency-loader dollar text-5xl">$</span>
          <span className="currency-loader rupee text-5xl">₹</span>
          </div>
          <span className="currency-loader rupee text-5xl">Please Wait</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 sm:p-6 md:p-1">
      <div className="flex flex-col items-start md:flex-row mx-auto">
        <div className="w-full md:w-1/5">
          <UserSidebar user={user} />
        </div>
        <div className="w-full md:w-4/5 rounded-lg shadow-lg">
          <Main user={user} setUser={setUser}/>
        </div>
      </div>
    </div>
  );
};

export default Profile;
