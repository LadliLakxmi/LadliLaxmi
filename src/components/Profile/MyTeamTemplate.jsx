import React from 'react';
import { Award, UserCircle2, Hash, Users } from 'lucide-react'; // Added Users icon for total count

// Level colors (adapted for individual member cards)
const levelCardColors = [
    "bg-blue-100 border-blue-500",
    "bg-green-100 border-green-500",
    "bg-yellow-100 border-yellow-500",
    "bg-purple-100 border-purple-500",
    "bg-pink-100 border-pink-500",
    "bg-indigo-100 border-indigo-500",
    "bg-teal-100 border-teal-500",
    "bg-red-100 border-red-500",
    "bg-orange-100 border-orange-500",
];

// 🔁 Recursive function to count all children in the matrix
const countAllDescendants = (user) => {
    if (!user?.matrixChildren || user.matrixChildren.length === 0) return 0;

    let count = user.matrixChildren.length;
    for (const child of user.matrixChildren) {
        count += countAllDescendants(child); // Recursively add children of each child
    }
    return count;
};

const MyTeamTemplate = ({ childs, isLast = false, parentHasSiblings = false }) => {
    const user = childs;
    const currentLevel = user.currentLevel || 0;
    const cardColorClass = levelCardColors[currentLevel % levelCardColors.length];
    const totalChildCount = countAllDescendants(user); // 🧮 Total child count

    return (
        <div className="min-w-full  my-1 ">
            {/* Node content */}
            <div className={` rounded-lg border-2 ${cardColorClass} text-gray-800 text-center flex  justify-evenly items-center  border-red-900 hover:scale-102 border   transform transition-transform duration-300  hover:shadow-xl  w-full relative z-10 shadow-md`}>
                <UserCircle2 size={40} className="text-gray-600 mb-2" />
                <div className="font-extrabold text-xl truncate mb-1">{user.name}</div>

                <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Hash size={14} /> ID: {user.referralCode || user._id || "N/A"}
                </div>

                <div className="text-md font-semibold mt-1 flex items-center gap-1">
                    <Award size={16} className="text-yellow-600" /> Level: {user.currentLevel}
                </div>

                {/* 👶 Total children count */}
                <div className="text-sm font-medium mt-1 flex items-center gap-1 text-blue-700">
                    <Users size={16} /> Total Children: {totalChildCount}
                </div>
            </div>

            {/* Recursive children rendering */}
            {user.matrixChildren?.length > 0 && (
                <div className="flex flex-row flex-wrap justify-center relative mt-4 pt-4 border-t border-gray-200">
                    {user.matrixChildren.map((child, index) => (
                        <React.Fragment key={child._id || index}>
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
