import React from "react";

// Level colors
const levelColors = [
  "bg-blue-100 border-blue-500",
  "bg-green-100 border-green-500",
  "bg-yellow-100 border-yellow-500",
  "bg-purple-100 border-purple-500",
  "bg-pink-100 border-pink-500",
  "bg-indigo-100 border-indigo-500",
];

const TreeNode = ({ user, isLast = false, parentHasSiblings = false }) => {
  const currentLevel = user.currentLevel || 0;
  const bgColor = levelColors[Math.min(currentLevel, levelColors.length - 1)];

  return (
    <div className="flex flex-col items-center relative min-w-[10rem] mx-1">
      {/* Connector from top */}
      {currentLevel > 0 && (
        <div className="absolute top-0 h-6 w-0.5 bg-gray-400"></div>
      )}

      {/* Node */}
      <div className={`${bgColor} p-2 sm:p-3 rounded-lg border-2 text-center mb-2 w-32 sm:w-40 md:w-48 shadow-sm relative z-10`}>
        <div className="font-bold truncate text-sm sm:text-base">{user.name}</div>
        <div className="text-xs truncate">ID: {user.referralCode || user._id?.slice(-6) || "N/A"}</div>
        <div className="text-xs sm:text-sm">Level: {currentLevel}</div>
      </div>

      {/* Children */}
      {user.matrixChildren?.length > 0 && (
        <div className="relative flex justify-center w-full">
          {/* Horizontal connector */}
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <div className="h-0.5 bg-gray-400 w-full max-w-[90%] mx-auto"></div>
          </div>

          <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 pt-6 w-full">
            {user.matrixChildren.map((child, index) => (
              <React.Fragment key={child._id || index}>
                {/* Vertical line to each child */}
                <div
                  className="absolute top-0 h-6 w-0.5 bg-gray-400"
                  style={{
                    left: `${(index + 0.5) * (100 / user.matrixChildren.length)}%`,
                    transform: "translateX(-50%)",
                  }}
                ></div>

                <TreeNode
                  user={child}
                  isLast={index === user.matrixChildren.length - 1}
                  parentHasSiblings={user.matrixChildren.length > 1}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MemoizedTreeNode = React.memo(TreeNode);

const Dashboard = ({ user }) => {
  return (
    <div className="p-4 text-black shadow-lg rounded-lg mt-4 sm:mt-8 w-full max-w-7xl mx-auto bg-white">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-blue-700">
        Matrix Network
      </h2>

      {user ? (
        <>
          <div className="bg-blue-50 mx-auto border border-blue-200 w-full max-w-md p-3 sm:p-4 rounded-md shadow text-center mb-4 sm:mb-6">
            <div className="font-semibold text-sm sm:text-base md:text-lg">{user.name}</div>
            <div className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">
              <span>Code: {user.referralCode}</span>
              <span className="ml-2 sm:ml-4">Level: {user.currentLevel}</span>
            </div>
          </div>

          <div className="overflow-x-auto px-2">
            <div className="flex justify-center min-w-max">
              {user.matrixChildren?.length > 0 ? (
                <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-4">
                  {user.matrixChildren.map((child, index) => (
                    <MemoizedTreeNode key={child._id || index} user={child} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 sm:py-12 w-full">
                  No downline members found
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-500 text-center py-8 sm:py-12">
          Loading user data...
        </div>
      )}
    </div>
  );
};

export default Dashboard;