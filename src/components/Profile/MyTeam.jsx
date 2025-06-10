import React from 'react';
import MyTeamTemplate from './MyTeamTemplate';
import { Users, User, LayoutGrid } from 'lucide-react'; // Added icons

const MyTeam = ({ team, matrixChildren }) => {
  // Ensure team and its properties are safely accessed
  const teamName = team?.name || "Your Team";
  const teamId = team?.referralCode || "N/A";
  const teamLevel = team?.currentLevel || 0;
  const members = team?.matrixChildren || []; // Use 'members' for clarity

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Team Header Card - Enhanced Design */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-xl shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center gap-4">
          <Users size={48} className="text-blue-300 drop-shadow-md" />
          <div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg">
              {teamName}
            </h2>
            <p className="text-blue-200 text-lg">Your Network Overview</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="bg-blue-600/50 px-4 py-2 rounded-lg shadow-inner flex items-center gap-2">
            <span className="font-semibold text-blue-100">Team ID:</span>
            <span className="font-bold text-white tracking-wide">{teamId}</span>
          </div>
          <div className="bg-blue-600/50 px-4 py-2 rounded-lg shadow-inner flex items-center gap-2">
            <span className="font-semibold text-blue-100">Your Level:</span>
            <span className="font-bold text-white">Level {teamLevel}</span>
          </div>
        </div>
      </div>

      {/* Team Members Grid - Enhanced Design */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          <LayoutGrid size={28} className="text-blue-600  " /> Direct Referrals
        </h3>
        {members.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2  justify-items-center">
            {members.map((child, index) => (
              // Passing `childs` as originally named in your component
              <MyTeamTemplate key={child._id || index} childs={child} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-12 text-gray-600 text-center text-lg animate-fadeIn shadow-inner">
            <p className="mb-4">No direct team members found yet.</p>
            <p>Start referring to build your network!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
