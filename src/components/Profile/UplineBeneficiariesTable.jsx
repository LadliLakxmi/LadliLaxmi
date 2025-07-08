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
        <div className="p-1 md:p-8 mt-10 md:mt-0 bg-white rounded-lg shadow-lg w-full overflow-x-auto">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-purple-500">
                Upline Help Beneficiaries
            </h2>

            {uplineBeneficiaries.length === 0 && currentUser && currentUser.currentLevel === 0 && (
                <p className="text-xl text-gray-600 italic text-center py-10">
             Welcome!!! Your upline beneficiaries will appear as you Activate Your Account by Paying ₹100.
                </p>
            )}

            <div className="overflow-x-auto w-full">
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

