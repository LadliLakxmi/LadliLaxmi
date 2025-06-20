
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- IMPORTANT: Replace with actual data from your backend if possible ---
// This map simulates the upgrade cost associated with each level.
// Your backend should ideally provide this information.
const UPGRADE_COSTS_BY_LEVEL = {
    1: 500,  // Example: Level 1 might cost 500
    2: 1000, // Example: Level 2 might cost 1000
    3: 2000,
    4: 4000,
    5: 8000,
    6: 16000,
    7: 32000,
    8: 64000,
    9: 128000,
    10: 256000, // Assuming a max of 10 levels for the table
    // ... add more levels as needed, or fetch this dynamically
};
// -------------------------------------------------------------------------

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

  const handlePayClick = (upline) => {
    // Only proceed if upline object is valid (not a placeholder without full data)
    if (upline && upline.name && upline.uplineLevel && upline.upgradeCostAssociated) {
        alert(`You clicked Pay for ${upline.name} at Upline Level ${upline.uplineLevel} for amount ₹${upline.upgradeCostAssociated}.`);
        console.log("Pay button clicked for:", upline);

        if (currentUser && currentUser.currentLevel !== undefined) {
            navigate(`/userdashboard/upgrade/${currentUser.currentLevel + 1}`);
        } else {
            console.error("Current user or current level is undefined, cannot navigate to upgrade.");
            // Optionally, show a user-friendly error message
        }
    } else {
        console.warn("Attempted to click Pay on an incomplete upline object (likely a placeholder).");
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

  // Determine the details of the last actual upline entry for name/email placeholders
  const lastActualUpline = uplineBeneficiaries.length > 0
    ? uplineBeneficiaries[uplineBeneficiaries.length - 1]
    : null;

  // Placeholder values for name/email in empty rows
  const placeholderName = lastActualUpline ? lastActualUpline.name : 'No Upline Found'; // Default if no uplines at all
  const placeholderEmail = lastActualUpline ? lastActualUpline.email : 'N/A'; // Default if no uplines at all

  const rowsToRender = 10; // Total number of rows to display

  return (
    <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
        Upline Help Beneficiaries
      </h2>

      {uplineBeneficiaries.length === 0 && ( // Only show this message if NO beneficiaries are found
        <p className="text-xl text-gray-600 italic text-center py-10">
          No upline beneficiaries found.
        </p>
      )}

      {/* Render table if there are beneficiaries or we intend to show empty rows */}
      {(uplineBeneficiaries.length > 0 || rowsToRender > 0) && (
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
              {/* Render actual upline beneficiaries */}
              {uplineBeneficiaries.map((upline) => {
                // Determine if this is the specific upline for the current user's next level
                const isNextLevelUpline = currentUser &&
                                          upline.uplineLevel === (currentUser.currentLevel + 1) &&
                                          upline.upgradeCostAssociated;

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
                        disabled={!isNextLevelUpline} // Correctly enable/disable for actual uplines
                      >
                        { isNextLevelUpline
                            ? 'Pay'
                            : 'Wait'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Add rows for empty levels, repeating last actual entry's name/email and dynamic help amount */}
              {Array.from({ length: Math.max(0, rowsToRender - uplineBeneficiaries.length) }).map((_, index) => {
                const currentPlaceholderLevel = uplineBeneficiaries.length + 1 + index;
                const placeholderHelpAmount = UPGRADE_COSTS_BY_LEVEL[currentPlaceholderLevel];

                // Check if this placeholder level is the user's *next* upgrade level
                const isPlaceholderNextLevelUpline = currentUser &&
                                                     currentPlaceholderLevel === (currentUser.currentLevel + 1) &&
                                                     placeholderHelpAmount; // Ensure there's an associated cost

                // Construct a partial upline object for handlePayClick for placeholder rows
                // This allows the handlePayClick to function similarly, but with placeholder data.
                const placeholderUplineData = {
                    name: placeholderName,
                    uplineLevel: currentPlaceholderLevel,
                    upgradeCostAssociated: placeholderHelpAmount,
                    // Add other properties if needed for the alert/console log, e.g., email: placeholderEmail
                };


                return (
                  <tr key={`empty-${currentPlaceholderLevel}`} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-base text-gray-500 italic">{currentPlaceholderLevel}</td>
                    <td className="py-4 px-6 text-base text-gray-500 italic">
                        {placeholderName}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-500 italic">
                        {placeholderEmail}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-500 italic">
                      {placeholderHelpAmount ? `₹${placeholderHelpAmount}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-base text-gray-500"> {/* Removed italic here for consistency with button */}
                      <button
                        // Apply the same logic as real uplines, but for the placeholder level
                        onClick={() => handlePayClick(placeholderUplineData)}
                        className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                          isPlaceholderNextLevelUpline
                            ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isPlaceholderNextLevelUpline} // Enable/disable based on next level
                      >
                        { isPlaceholderNextLevelUpline
                            ? 'Pay'
                            : 'Wait'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UplineBeneficiariesTable;

// // src/components/UplineBeneficiariesTable.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const UplineBeneficiariesTable = ({ currentUser }) => {
//   const navigate = useNavigate();
//   const [uplineBeneficiaries, setUplineBeneficiaries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUplines = async () => {
//       if (!currentUser) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(
//           // `http://localhost:4001/api/v1/upline/users/${currentUser._id}/upline-beneficiaries`,
//           `https://ladlilaxmi.onrender.com/api/v1/upline/users/${currentUser._id}/upline-beneficiaries`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setUplineBeneficiaries(response.data.data);
//       } catch (err) {
//         console.error("Error fetching upline beneficiaries:", err);
//         setError(err.response?.data?.message || 'Failed to load upline beneficiaries.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUplines();
//   }, [currentUser]);

//   // Function to handle the Pay button click
//   const handlePayClick = (upline) => {
//     // This alert confirms which button was clicked
//     alert(`You clicked Pay for ${upline.name} at Upline Level ${upline.uplineLevel} for amount ₹${upline.upgradeCostAssociated}.`);
//     console.log("Pay button clicked for:", upline);

//     // Navigate to the upgrade page for the *current user's next level*
//     // This navigation logic seems to be tied to the current user's general upgrade path,
//     // not necessarily directly linked to the specific upline clicked.
//     // Ensure this is the desired behavior.
//     if (currentUser && currentUser.currentLevel !== undefined) {
//       navigate(`/userdashboard/upgrade/${currentUser.currentLevel + 1}`);
//     } else {
//       console.error("Current user or current level is undefined, cannot navigate to upgrade.");
//       // Optionally, handle this error in the UI
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-10 text-xl text-blue-600">
//         Loading upline beneficiaries...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center py-10 text-xl text-red-600">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
//       <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
//         Upline Help Beneficiaries 
//       </h2>

//       {uplineBeneficiaries.length === 0 ? (
//         <p className="text-xl text-gray-600 italic text-center py-10">
//           No upline beneficiaries found.
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help Level</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help</th>
//                 <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Give Help</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {uplineBeneficiaries.map((upline) => {
//                 // Determine if this is the specific upline for the current user's next level
//                 const isNextLevelUpline = currentUser &&
//                                            upline.uplineLevel === (currentUser.currentLevel + 1) &&
//                                            upline.upgradeCostAssociated; // Ensure there's an amount

//                 return (
//                   <tr key={upline._id} className="hover:bg-gray-50">
//                     <td className="py-4 px-6 text-base text-gray-800">{upline.uplineLevel}</td>
//                     <td className="py-4 px-6 text-base text-gray-800">{upline.name}</td>
//                     <td className="py-4 px-6 text-base text-gray-800">{upline.email}</td>
//                     <td className="py-4 px-6 text-base text-gray-800">
//                       {upline.upgradeCostAssociated ? `₹${upline.upgradeCostAssociated}` : 'N/A'}
//                     </td>
//                     <td className="py-4 px-6 text-base text-gray-800">
//                       <button
//                         onClick={() => handlePayClick(upline)}
//                         className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
//                           isNextLevelUpline
//                             ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         }`}
//                         disabled={!isNextLevelUpline} // Disable button if not the next level upline
//                       >
//                        { isNextLevelUpline
//                             ? 'Pay'
//                             : 'Wait'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {/* Add rows for empty levels if you always want 10 rows displayed */}
//               {uplineBeneficiaries.length < 10 && Array.from({ length: 10 - uplineBeneficiaries.length }).map((_, index) => (
//                 <tr key={`empty-${index}`} className="hover:bg-gray-50">
//                   <td className="py-4 px-6 text-base text-gray-500 italic">{uplineBeneficiaries.length + 1 + index}</td>
//                   <td className="py-4 px-6 text-base text-gray-500 italic" colSpan="2">No Upline Found for this Level</td>
//                   <td className="py-4 px-6 text-base text-gray-500 italic">N/A</td> {/* For the Help column */}
//                   <td className="py-4 px-6 text-base text-gray-500 italic">
//                     <button
//                       className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-lg text-sm cursor-not-allowed"
//                       disabled // Always disabled for empty rows
//                     >
//                       Pay
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UplineBeneficiariesTable;