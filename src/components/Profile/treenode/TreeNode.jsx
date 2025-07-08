 import React from "react";
import { User, Layers } from 'lucide-react'; // Make sure to import User and Layers
import { Link } from 'react-router-dom'; // Assuming React Router

// Enhanced Level Colors for a richer look
const levelColors = [
  "bg-blue-600 border-blue-400", // Level 0 or default: Deeper blue
  "bg-indigo-600 border-indigo-400", // Level 1: Indigo
  "bg-purple-600 border-purple-400", // Level 2: Purple
  "bg-fuchsia-600 border-fuchsia-400", // Level 3: Fuchsia
  "bg-rose-600 border-rose-400", // Level 4: Rose
  "bg-red-600 border-red-400", // Level 5: Red
  "bg-orange-600 border-orange-400", // Level 6: Orange
  "bg-amber-600 border-amber-400", // Level 7: Amber
  "bg-lime-600 border-lime-400", // Level 8: Lime
  "bg-emerald-600 border-emerald-400", // Level 9: Emerald
  "bg-teal-600 border-teal-400", // Level 10: Teal
  "bg-cyan-600 border-cyan-400", // Level 11: Cyan
];


  // TreeNode component: Renders a single user node and its direct children recursively
export  const TreeNode = React.memo(({ user: member }) => {
    const currentLevel = member.currentLevel || 0;
    const colorIndex = Math.min(currentLevel, levelColors.length - 1);
    // Extract border color class for consistency
    const borderColorClass = levelColors[colorIndex].replace('bg-', 'border-');
const linkTo = `/userdashboard/downline-child-matrix/${member._id}`;
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
         <Link to={linkTo} className=" hover:underline">
        <div className="mt-3 text-center text-white w-full px-1">
          <div className="font-bold truncate text-sm sm:text-base leading-tight">{member.name || "Unknown"}</div>
{/*           <div className="text-xs sm:text-sm text-gray-300 truncate leading-tight">{member.phone || "N/A"}</div> */}
          <div className="text-xs text-gray-400 truncate leading-tight">ID: {member.referralCode || member._id?.slice(-6) || "N/A"}</div>
          <div className="text-xs sm:text-sm font-semibold mt-1 flex items-center justify-center gap-1 text-gray-200 leading-tight">
            <Layers size={14} className="text-white opacity-70" /> Level: {currentLevel}
          </div>
        </div>
        </Link>

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
