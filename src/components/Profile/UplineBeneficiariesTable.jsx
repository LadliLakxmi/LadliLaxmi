// src/components/UplineBeneficiariesTable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UplineBeneficiariesTable = ({ currentUser }) => {
  const navigate = useNavigate();
  const [uplineBeneficiaries, setUplineBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUplines = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
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
  }, [currentUser]);

  // Function to handle the Pay button click
  const handlePayClick = (upline) => {
    // This alert confirms which button was clicked
    alert(`You clicked Pay for ${upline.name} at Upline Level ${upline.uplineLevel} for amount ₹${upline.upgradeCostAssociated}.`);
    console.log("Pay button clicked for:", upline);

    // Navigate to the upgrade page for the *current user's next level*
    // This navigation logic seems to be tied to the current user's general upgrade path,
    // not necessarily directly linked to the specific upline clicked.
    // Ensure this is the desired behavior.
    if (currentUser && currentUser.currentLevel !== undefined) {
      navigate(`/userdashboard/upgrade/${currentUser.currentLevel + 1}`);
    } else {
      console.error("Current user or current level is undefined, cannot navigate to upgrade.");
      // Optionally, handle this error in the UI
    }
  };

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

      {uplineBeneficiaries.length === 0 ? (
        <p className="text-xl text-gray-600 italic text-center py-10">
          No upline beneficiaries found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help Level</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Give Help</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {uplineBeneficiaries.map((upline) => {
                // Determine if this is the specific upline for the current user's next level
                const isNextLevelUpline = currentUser &&
                                           upline.uplineLevel === (currentUser.currentLevel + 1) &&
                                           upline.upgradeCostAssociated; // Ensure there's an amount

                return (
                  <tr key={upline._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-base text-gray-800">{upline.uplineLevel}</td>
                    <td className="py-4 px-6 text-base text-gray-800">{upline.name}</td>
                    <td className="py-4 px-6 text-base text-gray-800">{upline.email}</td>
                    <td className="py-4 px-6 text-base text-gray-800">
                      {upline.upgradeCostAssociated ? `₹${upline.upgradeCostAssociated}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-800">
                      <button
                        onClick={() => handlePayClick(upline)}
                        className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                          isNextLevelUpline
                            ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isNextLevelUpline} // Disable button if not the next level upline
                      >
                       { isNextLevelUpline
                            ? 'Pay'
                            : 'Wait'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Add rows for empty levels if you always want 10 rows displayed */}
              {uplineBeneficiaries.length < 10 && Array.from({ length: 10 - uplineBeneficiaries.length }).map((_, index) => (
                <tr key={`empty-${index}`} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-base text-gray-500 italic">{uplineBeneficiaries.length + 1 + index}</td>
                  <td className="py-4 px-6 text-base text-gray-500 italic" colSpan="2">No Upline Found for this Level</td>
                  <td className="py-4 px-6 text-base text-gray-500 italic">N/A</td> {/* For the Help column */}
                  <td className="py-4 px-6 text-base text-gray-500 italic">
                    <button
                      className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-lg text-sm cursor-not-allowed"
                      disabled // Always disabled for empty rows
                    >
                      Pay
                    </button>
                  </td>
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