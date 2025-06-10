import React from "react";
import { Network, UserCircle, Share2, Award, User, Layers } from 'lucide-react'; // All necessary Lucide icons

// Enhanced Level Colors for a richer look
const levelColors = [
  "bg-blue-600 border-blue-400",    // Level 0 or default: Deeper blue
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

  // TreeNode component (formerly from TreeNode.jsx) moved inside Dashboard
  const TreeNode = React.memo(({ user: member }) => { // Renamed prop to 'member' to avoid conflict with Dashboard's 'user'
    const currentLevel = member.currentLevel || 0;
    // Ensure the color index is within bounds, defaulting to the last color for higher levels
    const colorIndex = Math.min(currentLevel, levelColors.length - 1);
    const bgColorClass = levelColors[colorIndex];

    return (
      <div className="flex flex-col items-center relative min-w-[8rem] sm:min-w-[10rem] mx-2 transition-all duration-300 ease-in-out">
        {/* Node Content */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${bgColorClass} text-white text-center w-36 sm:w-44 md:w-52 shadow-lg relative z-10
          transform transition-transform duration-200 hover:scale-105 hover:shadow-xl group`}>
          {/* Connection line from parent to this node, only if not the root of the tree (Level 0 usually) */}
          {currentLevel > 0 && (
            <div className="absolute -top-4 left-1/2 h-4 w-0.5 bg-gray-400 z-0"></div>
          )}

          <User size={32} className="mx-auto mb-1 text-white opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="font-extrabold truncate text-base sm:text-lg mb-1">{member.name}</div>
          <div className="font-extrabold truncate text-base sm:text-lg mb-1">{member.phone}</div>
          <div className="text-xs sm:text-sm text-gray-200 truncate">ID: {member.referralCode || member._id?.slice(-6) || "N/A"}</div>
          <div className="text-sm sm:text-base font-semibold mt-1 flex items-center justify-center gap-1">
            <Layers size={16} className="text-white opacity-70" /> Level: {currentLevel}
          </div>
        </div>

        {/* Children */}
        {member.matrixChildren?.length > 0 && (
          <div className="relative flex justify-center w-full mt-2">
            {/* Horizontal connector line for siblings */}
            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-gray-400 mx-auto w-[calc(100%-2rem)]"></div>

            <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6 pt-4 w-full">
              {member.matrixChildren.map((child, index) => (
                <React.Fragment key={child._id || index}>
                  {/* Vertical line from horizontal connector to each child */}
                  <div
                    className="absolute h-4 w-0.5 bg-gray-400 z-0"
                    style={{
                      top: '-1px', // Align with the horizontal line
                      left: `calc(${(index + 0.5) * (100 / member.matrixChildren.length)}% - 0.125rem)`, // Center on child
                      transform: "translateX(-50%)",
                    }}
                  ></div>

                  <TreeNode user={child} /> {/* Recursive call to itself */}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
      {/* Main Dashboard Container */}
      <div className=" text-white p-1 md:p-4 rounded-2xl shadow-2xl w-full max-w-7xl mx-auto relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
          <Network size={44} /> Your Matrix Network
        </h2>

        {user ? (
          <>
            {/* User's Root Node Information */}
            <div className="bg-blue-700/60 border border-blue-500 w-full max-w-md mx-auto p-4 sm:p-6 rounded-xl shadow-lg text-center mb-8 transform transition-all duration-300 hover:scale-105">
              <UserCircle size={48} className="mx-auto mb-2 text-blue-200 drop-shadow-md" />
              <h3 className="font-extrabold text-xl sm:text-2xl text-yellow-300 mb-1">{user.name}</h3>
              <p className="text-sm sm:text-base text-blue-100 mb-2 truncate">{user.email}</p>
              <p className="text-sm sm:text-base text-blue-100 mb-2 ">{user.phone}</p>
              <div className="text-sm sm:text-base text-blue-100 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <Share2 size={16} /> Code: <span className="font-mono">{user.referralCode}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award size={16} /> Level: <span className="font-semibold">{user.currentLevel}</span>
                </span>
              </div>
            </div>

            {/* Matrix Children Display */}
            <div className="overflow-x-auto py-4 px-2 custom-scrollbar">
              <div className="flex justify-center min-w-max">
                {user.matrixChildren?.length > 0 ? (
                  <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-6">
                    {user.matrixChildren.map((child, index) => (
                      <TreeNode key={child._id || index} user={child} />
                    ))}
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
