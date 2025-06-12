import React from "react";
import { Network, UserCircle, Share2, Award, User, Layers } from 'lucide-react'; // All necessary Lucide icons

// Enhanced Level Colors for a richer look
const levelColors = [
  "bg-blue-600 border-blue-400",     // Level 0 or default: Deeper blue
  "bg-indigo-600 border-indigo-400", // Level 1: Indigo
  "bg-purple-600 border-purple-400", // Level 2: Purple
  "bg-fuchsia-600 border-fuchsia-400",// Level 3: Fuchsia
  "bg-rose-600 border-rose-400",     // Level 4: Rose
  "bg-red-600 border-red-400",       // Level 5: Red
  "bg-orange-600 border-orange-400", // Level 6: Orange
  "bg-amber-600 border-amber-400",   // Level 7: Amber
  "bg-lime-600 border-lime-400",     // Level 8: Lime
  "bg-emerald-600 border-emerald-400",// Level 9: Emerald
  "bg-teal-600 border-teal-400",     // Level 10: Teal
  "bg-cyan-600 border-cyan-400"      // Level 11: Cyan
];

const Dashboard = ({ user }) => {

  // TreeNode component: Renders a single user node and its direct children recursively
  const TreeNode = React.memo(({ user: member }) => {
    const currentLevel = member.currentLevel || 0;
    const colorIndex = Math.min(currentLevel, levelColors.length - 1);
    // Extract border color class for consistency
    const borderColorClass = levelColors[colorIndex].replace('bg-', 'border-');

    return (
      <div className="flex flex-col items-center relative min-w-[7rem] sm:min-w-[9rem] mx-2 py-2 transition-all duration-300 ease-in-out">
        {/* Parent-to-child Vertical Line for the current node */}
        {/* This line originates from the parent node and connects *to* this node's circle */}
        {currentLevel > 0 && (
          <div className="absolute -top-1 left-1/2 h-4 w-0.5 bg-gray-600 z-0 transform -translate-x-1/2"></div>
        )}

        {/* Circular Node Container (User Icon Only) */}
        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${borderColorClass} flex items-center justify-center shadow-md cursor-pointer
          transform transition-transform duration-200 hover:scale-110 hover:shadow-lg bg-gray-800 z-10`}
        >
          <User size={36} className="text-white opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Text Details Below the Circular Node */}
        <div className="mt-3 text-center text-white w-full px-1">
          <div className="font-bold truncate text-sm sm:text-base leading-tight">{member.name || "Unknown"}</div>
          <div className="text-xs sm:text-sm text-gray-300 truncate leading-tight">{member.phone || "N/A"}</div>
          <div className="text-xs text-gray-400 truncate leading-tight">ID: {member.referralCode || member._id?.slice(-6) || "N/A"}</div>
          <div className="text-xs sm:text-sm font-semibold mt-1 flex items-center justify-center gap-1 text-gray-200 leading-tight">
            <Layers size={14} className="text-white opacity-70" /> Level: {currentLevel}
          </div>
        </div>

        {/* Children of this Node (Recursive rendering) */}
        {member.matrixChildren?.length > 0 && (
          <div className="relative flex justify-center w-full mt-8">
            {/* Horizontal connector line for siblings */}
            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-gray-600 mx-auto w-[calc(100%-2rem)]"></div>

            <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-4 w-full">
              {member.matrixChildren.map((child, index) => (
                // Each child node now has its own vertical line segment directly above it
                <div key={child._id || index} className="relative flex flex-col items-center">
                  {/* Vertical line from horizontal connector to this specific child */}
                  <div className="absolute -top-4 h-4 w-0.5 bg-gray-600 z-0 transform -translate-x-1/2"></div>
                  <TreeNode user={child} /> {/* Recursive call */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="min-h-screen mt-10 md:mt-0 bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
      {/* Main Dashboard Container */}
      <div className="text-white p-1 md:p-4 rounded-2xl shadow-2xl w-full max-w-7xl mx-auto relative overflow-hidden">
        {/* Decorative background elements for visual flair */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
          <Network size={44} /> Your Matrix Network
        </h2>

        {user ? (
          <>
            {/* User's Root Node Information Card */}
            <div className="bg-blue-700/60 border border-blue-500 w-fit mx-auto p-4 sm:p-6 rounded-full shadow-lg text-center mb-10 transform transition-all duration-300 hover:scale-105">
              <UserCircle size={50} className="mx-auto text-blue-200 drop-shadow-md" />
              <h3 className="font-extrabold text-xl sm:text-2xl text-yellow-300 mb-1">{user.name || "User Name"}</h3>
              <p className="text-sm sm:text-base text-blue-100 mb-2 truncate">{user.email || "user@example.com"}</p>
              <p className="text-sm sm:text-base text-blue-100 mb-2 ">{user.phone || "N/A"}</p>
              <div className="text-sm sm:text-base text-blue-100 flex-col items-center justify-center gap-4">
                
                  <p className="flex items-baseline justify-center ">
                    <Share2 size={16} /> Code: <span className="font-mono">{user.referralCode || "N/A"}</span>
                    </p>
                
                <p className="flex items-baseline justify-center ">
                  <Award size={16} /> Level: <span className="font-semibold">{user.currentLevel || 0}</span>

                </p>
                
              </div>
            </div>

            {/* Matrix Children Display Section */}
            <div className="overflow-x-auto py-4 px-2 custom-scrollbar">
              <div className="flex justify-center min-w-max">
                {user.matrixChildren?.length > 0 ? (
                  // This wrapper manages the layout and connector lines for the immediate children of the top-level user
                  <div className="relative flex justify-center w-full mt-4">
                    {/* Horizontal connector line for the very first level of siblings */}
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-gray-600 mx-auto w-[calc(100%-2rem)]"></div>
                    <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-4 w-full">
                      {user.matrixChildren.map((child, index) => (
                        // Each top-level child node now also gets its own vertical line segment
                        <div key={child._id || index} className="relative flex flex-col items-center">
                          {/* Vertical line from horizontal connector to this specific child */}
                          <div className="absolute -top-4 h-4 w-0.5 bg-gray-600 z-0 transform -translate-x-1/2"></div>
                          <TreeNode user={child} /> {/* Render each top-level child node */}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-800/40 border border-blue-600 rounded-lg p-8 text-blue-200 text-center text-lg animate-fadeIn shadow-inner w-full">
                    <p className="mb-4">It looks a little empty here!</p>
                    <p>Start referring to build your powerful matrix network.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-blue-300 text-center py-12 text-xl font-semibold">
            Loading your network data...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
