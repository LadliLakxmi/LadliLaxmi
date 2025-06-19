// src/components/UplineBeneficiariesTable.jsx
import React, { useState, useEffect } from 'react'; // Removed useContext for AuthContext as currentUser is prop
import axios from 'axios';

const UplineBeneficiariesTable = ({ currentUser }) => {
    console.log(currentUser)
  const [uplineBeneficiaries, setUplineBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // REMOVED: const [targetUpgradeLevel, setTargetUpgradeLevel] = useState(1);

  useEffect(() => {
    const fetchUplines = async () => {
      if (!currentUser ) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // REMOVED: ?targetLevel=${targetUpgradeLevel}
        const response = await axios.get(
          // `http://localhost:4001/api/v1/upline/users/${currentUser._id}/upline-beneficiaries`,
          `https://ladlilaxmi.onrender.com/api/v1/upline/users/${currentUser._id}/upline-beneficiaries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUplineBeneficiaries(response.data.data);
      } catch (err) {
        console.error("Error fetching upline beneficiaries:", err);
        setError(err.response?.data?.message || 'Failed to load upline beneficiaries.');
      } finally {
        setLoading(false);
      }
    };

    fetchUplines();
  }, [currentUser]); // Now only re-fetches when currentUser changes

  // REMOVED: handleLevelChange function

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-xl text-blue-600">
        Loading upline beneficiaries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10 text-xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
        Upline Help Beneficiaries 
      </h2>

      {/* REMOVED: The select dropdown for target upgrade level */}

      {uplineBeneficiaries.length === 0 ? (
        <p className="text-xl text-gray-600 italic text-center py-10">
          No upline beneficiaries found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Give Help at Level</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                {/* Optional: Show their current level if relevant for user info */}
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Upline's Current Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {uplineBeneficiaries.map((upline) => (
                <tr key={upline._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-base text-gray-800">{upline.uplineLevel}</td>
                  <td className="py-4 px-6 text-base text-gray-800">{upline.name}</td>
                  <td className="py-4 px-6 text-base text-gray-800">{upline.email}</td>
                  <td className="py-4 px-6 text-base text-gray-800">{upline.currentLevelOfUpline}</td>
                </tr>
              ))}
              {/* Add rows for empty levels if you always want 10 rows displayed */}
              {uplineBeneficiaries.length < 10 && Array.from({ length: 10 - uplineBeneficiaries.length }).map((_, index) => (
                <tr key={`empty-${index}`} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-base text-gray-500 italic">{uplineBeneficiaries.length + 1 + index}</td>
                  <td className="py-4 px-6 text-base text-gray-500 italic" colSpan="3">No Upline Found for this Level</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UplineBeneficiariesTable;