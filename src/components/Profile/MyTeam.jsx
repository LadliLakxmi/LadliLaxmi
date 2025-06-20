import React from 'react';
import { Users, LayoutGrid, Table2, Award, UserCircle2, Mail, Link } from 'lucide-react'; // Added more specific icons

// Helper function to flatten the nested team structure
const flattenTeam = (members) => {
    let flatList = [];
    members.forEach(member => {
        flatList.push(member);
        if (member.matrixChildren && member.matrixChildren.length > 0) {
            flatList = flatList.concat(flattenTeam(member.matrixChildren));
        }
    });
    return flatList;
};

const MyTeam = ({ team }) => {
    const teamName = team?.name || "Your Team";
    const teamId = team?.referralCode || "N/A";
    const teamLevel = team?.currentLevel || 0;
    const directMembers = team?.matrixChildren || []; // Direct referrals
    const allTeamMembers = flattenTeam(directMembers); // Flattened list for the table

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Main Team Header Card - Enhanced Design */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-6 md:p-8 rounded-2xl shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between space-y-5 md:space-y-0 md:space-x-8 transform transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
                <div className="flex items-center gap-5">
                    <Users size={56} className="text-blue-300 drop-shadow-lg" />
                    <div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 tracking-tight leading-tight">
                            {teamName}
                        </h2>
                        <p className="text-blue-200 text-xl mt-1">Your Network Overview</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <div className="bg-blue-600/40 backdrop-blur-sm px-5 py-2.5 rounded-lg shadow-inner flex items-center gap-3 border border-blue-500/30">
                        <span className="font-semibold text-blue-100 text-lg">Team ID:</span>
                        <span className="font-bold text-white text-lg tracking-wide">{teamId}</span>
                    </div>
                    <div className="bg-blue-600/40 backdrop-blur-sm px-5 py-2.5 rounded-lg shadow-inner flex items-center gap-3 border border-blue-500/30">
                        <span className="font-semibold text-blue-100 text-lg">Your Level:</span>
                        <span className="font-bold text-white text-lg">Level {teamLevel}</span>
                    </div>
                </div>
            </div>

            {/* Team Members Table */}
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-gray-800">
                    <Table2 size={32} className="text-blue-600" /> All Team Members
                </h3>
                {allTeamMembers.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-xl">
                                        <div className="flex items-center justify-center gap-2">
                                            <UserCircle2 size={18} /> Name
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link size={18} /> ID
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-2">
                                            <Mail size={18} /> Email
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-2">
                                            <Award size={18} /> Level
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tr-xl">
                                        <div className="flex items-center justify-center gap-2">
                                            <Users size={18} /> Direct Referrals
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {allTeamMembers.map((member, index) => (
                                    <tr
                                        key={member._id || member.referralCode}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200 ease-in-out`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">
                                            {member.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                            {member.referralCode || member._id || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                            {member.email || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Level {member.currentLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                {member.matrixChildren?.length || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-gray-600 text-center text-lg animate-fadeIn shadow-inner-lg mt-8">
                        <p className="mb-4 text-xl font-semibold">No team members found yet. Please wait while we are Searching....</p>
                        <p className="text-gray-500">Start referring to build your network and see your team grow!</p>
                        <LayoutGrid size={40} className="text-gray-300 mx-auto mt-6" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTeam;