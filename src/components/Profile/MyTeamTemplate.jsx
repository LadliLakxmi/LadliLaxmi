import React from 'react';
import { Award, UserCircle2, Hash } from 'lucide-react'; // Added icons

// Level colors (adapted for individual member cards)
const levelCardColors = [
  "bg-blue-100 border-blue-500",    // Default/Level 0
  "bg-green-100 border-green-500",  // Level 1
  "bg-yellow-100 border-yellow-500",// Level 2
  "bg-purple-100 border-purple-500",// Level 3
  "bg-pink-100 border-pink-500",    // Level 4
  "bg-indigo-100 border-indigo-500",// Level 5
  "bg-teal-100 border-teal-500",    // Add more colors if levels can go higher
  "bg-red-100 border-red-500",
  "bg-orange-100 border-orange-500",
];

const MyTeamTemplate = ({ childs, isLast = false, parentHasSiblings = false }) => {
    const user = childs; // Renamed to 'user' as per your original template
    const currentLevel = user.currentLevel || 0;
    // Choose color based on level, wrapping around if levels exceed defined colors
    const cardColorClass = levelCardColors[currentLevel % levelCardColors.length];

    return (
        <div className="min-w-full transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl rounded-lg">
            {/* Node content - Enhanced Design */}
            <div className={`p-4 rounded-lg border-2 ${cardColorClass} text-gray-800 text-center flex flex-col items-center justify-center w-full relative z-10 shadow-md`}>
                <UserCircle2 size={40} className="text-gray-600 mb-2" /> {/* User icon */}
                <div className="font-extrabold text-xl truncate mb-1">{user.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Hash size={14} /> ID: {user.referralCode || user._id || "N/A"}
                </div>
                <div className="text-md font-semibold mt-1 flex items-center gap-1">
                    <Award size={16} className="text-yellow-600" /> Level: {user.currentLevel}
                </div>
            </div>

            {/* Children - Recursive rendering for sub-levels */}
            {user.matrixChildren?.length > 0 && (
                <div className="flex flex-row flex-wrap justify-center relative mt-4 pt-4 border-t border-gray-200">
                    {/* Optional: Add a subtle connector line if desired, but for this structure, it's often handled by visual spacing */}
                    {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-0.5 bg-gray-400"></div> */}

                    {user.matrixChildren.map((child, index) => (
                        <React.Fragment key={child._id || index}>
                            {/* Pass `childs` prop to match the component's expected prop name */}
                            <MyTeamTemplate
                                childs={child}
                                isLast={index === user.matrixChildren.length - 1}
                                parentHasSiblings={user.matrixChildren.length > 1}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTeamTemplate;
