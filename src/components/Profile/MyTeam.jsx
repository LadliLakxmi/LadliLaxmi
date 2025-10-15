import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, LayoutGrid, Table2, Award, UserCircle2, Mail, Link } from 'lucide-react';

const ITEMS_PER_PAGE = 100;

const MyTeam = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || !user._id) {
        setMembers([]);
        setTotalCount(0);
        return;
      }
      setLoading(true);
      setError(null);
      console.log(user._id)
      try {
        const res = await axios.get(
          `https://ladlilakshmi.onrender.com/api/v1/profile/get-team-paged/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: currentPage, limit: ITEMS_PER_PAGE },
          }
        );

        if (res.data.members && Array.isArray(res.data.members)) {
          setMembers(res.data.members);
          setTotalCount(res.data.totalCount || 0);
        } else {
          setMembers([]);
          setTotalCount(0);
          setError('Invalid response from server.');
        }
      } catch (err) {
        setMembers([]);
        setTotalCount(0);
        setError('Failed to fetch team members.');
        console.error('Error fetching team:', err);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [user, currentPage, token]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-gray-800">
          <Table2 size={32} className="text-blue-600" /> All Team Members
        </h3>

        {loading ? (
          <div  className='text-black'>Loading team members... Please wait....</div>
        ) : error ? (
          <div className="text-red-600 font-semibold">{error}</div>
        ) : members.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-xl">
                      <div className="flex items-center justify-center gap-2">
                        <Table2 size={18} /> S.No.
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-xl">
                      <div className="flex items-center justify-center gap-2">
                        <UserCircle2 size={18} /> Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Link size={18} /> ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Mail size={18} /> Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <Award size={18} /> Level
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tr-xl">
                      <div className="flex items-center justify-center gap-2">
                        <Users size={18} /> Direct Referrals
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {members.map((member, index) => (
                    <tr
                      key={member._id || member.referralCode}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors duration-200 ease-in-out`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {member.referralCode || member._id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {member.email || 'N/A'}
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

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-semibold self-center">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-gray-600 text-center text-lg animate-fadeIn shadow-inner-lg mt-8">
            <p className="mb-4 text-xl font-semibold">
              No team members found yet. Please wait while we are Searching....
            </p>
            <p className="text-gray-500">
              Start referring to build your network and see your team grow!
            </p>
            <LayoutGrid size={40} className="text-gray-300 mx-auto mt-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
// import { Users, LayoutGrid, Table2, Award, UserCircle2, Mail, Link } from 'lucide-react'; // Added more specific icons

// // Helper function to flatten the nested team structure
// const flattenTeam = (members) => {
//     let flatList = [];
//     members.forEach(member => {
//         flatList.push(member);
//         if (member.matrixChildren && member.matrixChildren.length > 0) {
//             flatList = flatList.concat(flattenTeam(member.matrixChildren));
//         }
//     });
//     return flatList;
// };

// const MyTeam = ({ team }) => {
//     const teamName = team?.name || "Your Team";
//     const teamId = team?.referralCode || "N/A";
//     const teamLevel = team?.currentLevel || 0;
//     const directMembers = team?.matrixChildren || []; // Direct referrals
//     const allTeamMembers = flattenTeam(directMembers); // Flattened list for the table

//     return (
//         <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

//             {/* Team Members Table */}
//             <div className="text-center mb-8">
//                 <h3 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3 text-gray-800">
//                     <Table2 size={32} className="text-blue-600" /> All Team Members
//                 </h3>
//                 {allTeamMembers.length > 0 ? (
//                     <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-blue-50">
//                                 <tr>
//                                     {/* New: Serial Number Header */}
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-xl">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <Table2 size={18} /> S.No.
//                                         </div>
//                                     </th>
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tl-xl">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <UserCircle2 size={18} /> Name
//                                         </div>
//                                     </th>
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <Link size={18} /> ID
//                                         </div>
//                                     </th>
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <Mail size={18} /> Email
//                                         </div>
//                                     </th>
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <Award size={18} /> Level
//                                         </div>
//                                     </th>
//                                     <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-blue-800 uppercase tracking-wider rounded-tr-xl">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <Users size={18} /> Direct Referrals
//                                         </div>
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-100">
//                                 {allTeamMembers.map((member, index) => (
//                                     <tr
//                                         key={member._id || member.referralCode}
//                                         className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200 ease-in-out`}
//                                     >
//                                         {/* New: Serial Number Data Cell */}
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-center">
//                                             {index + 1}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">
//                                             {member.name}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
//                                             {member.referralCode || member._id || "N/A"}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
//                                             {member.email || "N/A"}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
//                                             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
//                                                 Level {member.currentLevel}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
//                                             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
//                                                 {member.matrixChildren?.length || 0}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 ) : (
//                     <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-gray-600 text-center text-lg animate-fadeIn shadow-inner-lg mt-8">
//                         <p className="mb-4 text-xl font-semibold">No team members found yet. Please wait while we are Searching....</p>
//                         <p className="text-gray-500">Start referring to build your network and see your team grow!</p>
//                         <LayoutGrid size={40} className="text-gray-300 mx-auto mt-6" />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default MyTeam;