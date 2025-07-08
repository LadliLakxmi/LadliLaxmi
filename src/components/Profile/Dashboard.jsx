import React from "react";
import { Network, UserCircle, Share2, Award, User, Layers } from 'lucide-react'; // All necessary Lucide icons
import { TreeNode } from "./treenode/TreeNode";


const Dashboard = ({ user }) => {

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
