import React from 'react';
import { User, Mail, Phone, Link, Award, Table2, Users } from 'lucide-react'; // Import necessary icons

const DirectTeam = ({ team }) => {
  // Ensure directReferrals array is safely accessed
  const directMembers = team?.directReferrals || [];

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Optional: A header card specific to Direct Team if needed,
          but usually, this component would be nested under a main dashboard.
          For now, I'll just add a table header. */}

      {/* Direct Referrals Table */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-gray-800">
          <Users size={32} className="text-purple-600" /> Your Direct Referrals
        </h3>

        {directMembers.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  {/* New: Serial Number Header */}
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider rounded-tl-xl">
                    <div className="flex items-center justify-center gap-2">
                      <Table2 size={18} /> S.No.
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider rounded-tl-xl">
                    <div className="flex items-center justify-center gap-2">
                      <User size={18} /> Name
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <Mail size={18} /> Email
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <Phone size={18} /> Phone
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-2">
                      <Link size={18} /> Referral Code
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-purple-800 uppercase tracking-wider rounded-tr-xl">
                    <div className="flex items-center justify-center gap-2">
                      <Award size={18} /> Level
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {directMembers.map((member, index) => (
                  <tr
                    key={member._id || index} // Use _id as key, fallback to index
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors duration-200 ease-in-out`}
                  >
                    {/* New: Serial Number Data Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-center">
                      {index + 1}
                    </td>
                    <td className="px-6  py-4 whitespace-nowrap text-sm font-bold text-black text-center">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold text-center">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold text-center">
                      {member.phone || 'N/A'} {/* Phone might be optional */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black  font-bold text-center">
                      {member.referralCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-bold text-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        Level {member.currentLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-black text-center text-lg animate-fadeIn shadow-inner-lg mt-8">
            <p className="mb-4 text-xl font-semibold">No direct referrals found yet. Please wait while we are Searching....</p>
            <p className="text-gray-500">Share your referral code to grow your direct team!</p>
            <Users size={40} className="text-gray-300 mx-auto mt-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectTeam;