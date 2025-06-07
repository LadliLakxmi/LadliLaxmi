import React, { useEffect, useState } from "react";
import UserSidebar from "../components/Profile/userSidebar";
import axios from "axios";
import Main from "../components/Profile/main";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          `http://localhost:4001/api/v1/profile/getprofile/${userId}`,{
           headers: {
              Authorization: `Bearer ${token}`,
            },}
        );
        setUser(data.data.profile);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    if (userId) fetchData();
  }, [userId]);
  console.log("user",user)
  if (!user) return <div className="text-center mt-20 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-800 sm:p-6 md:p-1">
      <div className="flex flex-col items-start  md:flex-row mx-auto">
        <div className="w-full  md:w-1/5">
          <UserSidebar user={user} />
        </div>
        <div className="w-full  md:w-4/5 rounded-lg shadow-lg ">
          <Main user={user} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
