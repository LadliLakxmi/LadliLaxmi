import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- IMPORTANT: Replace with actual data from your backend if possible ---
// This map simulates the upgrade cost associated with each level.
// Your backend should ideally provide this information.
const UPGRADE_COSTS_BY_LEVEL = {
    1: 400,
    2: 500,
    3: 1000,
    4: 2000,
    5: 4000,
    6: 8000,
    7: 16000,
    8: 32000,
    9: 64000,
    10: 128000,
    11: 256000,
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
            if (!currentUser || !currentUser._id) {
                setLoading(false);
                setError("User data not available. Please log in.");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    // Assuming your backend endpoint for fetching uplines by user ID
                    // Make sure this endpoint actually returns the 'uplineLevel' and 'upgradeCostAssociated'
                    // for each beneficiary, which is crucial for the logic below.
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
    }, [currentUser]); // Dependency on currentUser to re-fetch if it changes

    const handlePayClick = (uplineLevel) => {
        // This function should be called only for the 'Pay' button, which is for the next level.
        // The navigation assumes that the path `/userdashboard/upgrade/:level` will handle the payment for that level.
        if (currentUser && currentUser.currentLevel !== undefined) {
            const nextLevelToPay = currentUser.currentLevel + 1;
            if (uplineLevel === nextLevelToPay) {
                // Here you would typically initiate the payment process, e.g., navigate to a payment page
                // or open a modal. For this example, we'll just navigate.
                console.log(`Navigating to pay for Level ${nextLevelToPay}.`);
                navigate(`/userdashboard/upgrade/${nextLevelToPay}`);
            } else {
                console.warn(`Attempted to pay for level ${uplineLevel} but current next level is ${nextLevelToPay}.`);
            }
        } else {
            console.error("Current user or current level is undefined, cannot initiate payment.");
            // Optionally, show a user-friendly error message to the user
            alert("Unable to process payment: User level not determined. Please refresh.");
        }
    };

    // Helper function to determine button state and text
    const getButtonState = (level) => {
        if (!currentUser || currentUser.currentLevel === undefined) {
            return { text: 'Loading...', disabled: true, className: 'bg-gray-400 text-gray-700 cursor-not-allowed' };
        }

        const userCurrentLevel = currentUser.currentLevel;
        const nextLevelToPay = userCurrentLevel + 1;

        if (level <= userCurrentLevel) {
            return { text: 'Complete', disabled: true, className: 'bg-green-600 text-white cursor-not-allowed opacity-80' };
        } else if (level === nextLevelToPay) {
            // This is the level the user needs to pay for next
            return { text: 'Pay', disabled: false, className: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400' };
        } else {
            return { text: 'Coming', disabled: true, className: 'bg-gray-400 text-gray-700 cursor-not-allowed' };
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
    const placeholderName = lastActualUpline ? lastActualUpline.name : ' Hii Welenter ';
    const placeholderEmail = lastActualUpline ? lastActualUpline.email : 'Welcome to LadliLaksmi';

    const rowsToRender = 11; // Total number of rows to display

    return (
        <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
                Upline Help Beneficiaries
            </h2>

            {uplineBeneficiaries.length === 0 && currentUser && currentUser.currentLevel === 0 && (
                <p className="text-xl text-gray-600 italic text-center py-10">
             Welcome!!! Your upline beneficiaries will appear as you Activate Your Account by Paying ₹100.
                </p>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help Level</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Help Amount</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* Render actual upline beneficiaries */}
                        {Array.from({ length: rowsToRender }).map((_, index) => {
                            const level = index + 1;
                            const upline = uplineBeneficiaries.find(b => b.uplineLevel === level);
                            const displayUplineName = upline ? upline.name : placeholderName;
                            const displayUplineEmail = upline ? upline.email : placeholderEmail;
                            const displayHelpAmount = upline && upline.upgradeCostAssociated 
                                ? `₹${upline.upgradeCostAssociated}` 
                                : (UPGRADE_COSTS_BY_LEVEL[level] ? `₹${UPGRADE_COSTS_BY_LEVEL[level]}` : 'N/A');

                            const buttonState = getButtonState(level);

                            return (
                                <tr key={level} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-base text-gray-800">{level}</td>
                                    <td className="py-4 px-6 text-base text-gray-800">{displayUplineName}</td>
                                    <td className="py-4 px-6 text-base text-gray-800">{displayUplineEmail}</td>
                                    <td className="py-4 px-6 text-base text-gray-800">{displayHelpAmount}</td>
                                    <td className="py-4 px-6 text-base text-gray-800">
                                        <button
                                            onClick={() => handlePayClick(level)}
                                            className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${buttonState.className}`}
                                            disabled={buttonState.disabled}
                                        >
                                            {buttonState.text}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UplineBeneficiariesTable;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// // --- IMPORTANT: Replace with actual data from your backend if possible ---
// // This map simulates the upgrade cost associated with each level.
// // Your backend should ideally provide this information.
// const UPGRADE_COSTS_BY_LEVEL = {
//   1: 400,  
//   2: 500,  // Example: Level 1 might cost 500
//   3: 1000, // Example: Level 2 might cost 1000
//   4: 2000,
//   5: 4000,
//   6: 8000,
//   7: 16000,
//   8: 32000,
//   9: 64000,
//   10:128000,
//   11:256000, // Assuming a max of 10 levels for the table
//   // ... add more levels as needed, or fetch this dynamically
// };
// // -------------------------------------------------------------------------

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
//           // `https://ladlilaxmi.onrender.com/api/v1/upline/users/${currentUser._id}/upline-beneficiaries`,
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

//   const handlePayClick = (upline) => {
//     // Only proceed if upline object is valid (not a placeholder without full data)
//     if (upline && upline.name && upline.uplineLevel && upline.upgradeCostAssociated) {
//       alert(`You clicked Pay for ${upline.name} at Upline Level ${upline.uplineLevel} for amount ₹${upline.upgradeCostAssociated}.`);
//       console.log("Pay button clicked for:", upline);

//       if (currentUser && currentUser.currentLevel !== undefined) {
//         navigate(`/userdashboard/upgrade/${currentUser.currentLevel + 1}`);
//       } else {
//         console.error("Current user or current level is undefined, cannot navigate to upgrade.");
//         // Optionally, show a user-friendly error message
//       }
//     } else {
//       console.warn("Attempted to click Pay on an incomplete upline object (likely a placeholder).");
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

//   // Determine the details of the last actual upline entry for name/email placeholders
//   const lastActualUpline = uplineBeneficiaries.length > 0
//     ? uplineBeneficiaries[uplineBeneficiaries.length - 1]
//     : null;

//   // Placeholder values for name/email in empty rows
//   const placeholderName = lastActualUpline ? lastActualUpline.name : 'No Upline Found'; // Default if no uplines at all
//   const placeholderEmail = lastActualUpline ? lastActualUpline.email : 'N/A'; // Default if no uplines at all

//   const rowsToRender = 10; // Total number of rows to display

//   return (
//     <div className="p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
//       <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
//         Upline Help Beneficiaries
//       </h2>

//       {uplineBeneficiaries.length === 0 && ( // Only show this message if NO beneficiaries are found
//         <p className="text-xl text-gray-600 italic text-center py-10">
//           No upline beneficiaries found.
//         </p>
//       )}

//       {/* Render table if there are beneficiaries or we intend to show empty rows */}
//       {(uplineBeneficiaries.length > 0 || rowsToRender > 0) && (
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
//               {/* Render actual upline beneficiaries */}
//               {uplineBeneficiaries.map((upline) => {
//                 // Determine if this is the specific upline for the current user's next level
//                 const isNextLevelUpline = currentUser &&
//                   upline.uplineLevel === (currentUser.currentLevel + 1) &&
//                   upline.upgradeCostAssociated;

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
//                         className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${isNextLevelUpline
//                             ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                           }`}
//                         disabled={!isNextLevelUpline} // Correctly enable/disable for actual uplines
//                       >
//                         {isNextLevelUpline
//                           ? 'Pay'
//                           : 'Wait'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}

//               {/* Add rows for empty levels, repeating last actual entry's name/email and dynamic help amount */}
//               {Array.from({ length: Math.max(0, rowsToRender - uplineBeneficiaries.length) }).map((_, index) => {
//                 const currentPlaceholderLevel = uplineBeneficiaries.length + 1 + index;
//                 const placeholderHelpAmount = UPGRADE_COSTS_BY_LEVEL[currentPlaceholderLevel];

//                 // Check if this placeholder level is the user's *next* upgrade level
//                 const isPlaceholderNextLevelUpline = currentUser &&
//                   currentPlaceholderLevel === (currentUser.currentLevel + 1) &&
//                   placeholderHelpAmount; // Ensure there's an associated cost

//                 // Construct a partial upline object for handlePayClick for placeholder rows
//                 // This allows the handlePayClick to function similarly, but with placeholder data.
//                 const placeholderUplineData = {
//                   name: placeholderName,
//                   uplineLevel: currentPlaceholderLevel,
//                   upgradeCostAssociated: placeholderHelpAmount,
//                   // Add other properties if needed for the alert/console log, e.g., email: placeholderEmail
//                 };


//                 return (
//                   <tr key={`empty-${currentPlaceholderLevel}`} className="hover:bg-gray-50">
//                     <td className="py-4 px-6 text-base text-gray-500 italic">{currentPlaceholderLevel}</td>
//                     <td className="py-4 px-6 text-base text-gray-500 italic">
//                       {placeholderName}
//                     </td>
//                     <td className="py-4 px-6 text-base text-gray-500 italic">
//                       {placeholderEmail}
//                     </td>
//                     <td className="py-4 px-6 text-base text-gray-500 italic">
//                       {placeholderHelpAmount ? `₹${placeholderHelpAmount}` : 'N/A'}
//                     </td>
//                     <td className="py-4 px-6 text-base text-gray-500"> {/* Removed italic here for consistency with button */}
//                       <button
//                         // Apply the same logic as real uplines, but for the placeholder level
//                         onClick={() => handlePayClick(placeholderUplineData)}
//                         className={`font-bold py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 ${isPlaceholderNextLevelUpline
//                             ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400'
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                           }`}
//                         disabled={!isPlaceholderNextLevelUpline} // Enable/disable based on next level
//                       >
//                         {isPlaceholderNextLevelUpline
//                           ? 'Pay'
//                           : 'Wait'}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UplineBeneficiariesTable;

