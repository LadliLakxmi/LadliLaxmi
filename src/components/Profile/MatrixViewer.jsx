import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"; // Correct import for useParams
import { TreeNode } from './treenode/TreeNode'; // Make sure this path is correct
import axios from 'axios';
import { Network, UserCircle, Share2, Award } from 'lucide-react'; // Import necessary icons for MatrixViewer

// Enhanced Level Colors for a richer look (assuming this is shared or defined here)
const levelColors = [
    "bg-blue-600 border-blue-400",    // Level 0 or default: Deeper blue
    "bg-indigo-600 border-indigo-400", // Level 1: Indigo
    "bg-purple-600 border-purple-400", // Level 2: Purple
    "bg-fuchsia-600 border-fuchsia-400",// Level 3: Fuchsia
    "bg-rose-600 border-rose-400",     // Level 4: Rose
    "bg-red-600 border-red-400",       // Level 5: Red
    "bg-orange-600 border-orange-400", // Level 6: Orange
    "bg-amber-600 border-amber-400",   // Level 7: Amber
    "bg-lime-600 border-lime-400",     // Level 8: Lime
    "bg-emerald-600 border-emerald-400",// Level 9: Emerald
    "bg-teal-600 border-teal-400",     // Level 10: Teal
    "bg-cyan-600 border-cyan-400"      // Level 11: Cyan
];


const MatrixViewer = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Correctly fetch the 'id' parameter from the URL
    // The name 'id' must match the parameter name in your route definition (e.g., /path/:id)
    const { id: userIdFromUrl } = useParams(); // Destructure 'id' and rename it to userIdFromUrl

    // You need to get the token. For demonstration, I'll use a placeholder.
    // In a real app, this would come from localStorage, a Context API, or Redux.
    const token = localStorage.getItem('token'); // Example: Fetch from localStorage

    useEffect(() => {
        const fetchData = async () => {
            if (!userIdFromUrl || !token) { // Ensure userIdFromUrl and token exist
                setLoading(false);
                if (!userIdFromUrl) setError("User ID not found in URL.");
                if (!token) setError("Authentication token not found.");
                return;
            }

            setLoading(true);
            setError(null); // Clear previous errors
            try {
                // Using the userIdFromUrl obtained from useParams
                const response = await axios.get(
                    `https://ladlilakshmi.onrender.com/api/v1/profile/getprofile/${userIdFromUrl}`, // Use userIdFromUrl here
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setUser(response.data.profile); // Assuming the response structure is { data: { profile: ... } }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setError("Failed to load user data. Please try again.");
                setUser(null); // Clear user data on error
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Call fetchData when component mounts or dependencies change
    }, [userIdFromUrl, token]); // Dependencies: re-run effect if userIdFromUrl or token changes

    // Pass levelColors to TreeNode if it's defined outside and not imported globally
    // You might need to update TreeNode to accept `levelColors` as a prop if it's not imported there.
    // For this example, I'm assuming levelColors is accessible to TreeNode (e.g., imported in TreeNode.js)

    if (loading) {
        return (
            <div className="min-h-screen mt-10 md:mt-0 bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
                <div className="text-blue-300 text-center py-12 text-xl font-semibold">
                    Loading your network data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen mt-10 md:mt-0 bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8 flex items-center justify-center">
                <div className="text-red-400 text-center py-12 text-xl font-semibold">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-10 md:mt-0 bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
            {/* Main Dashboard Container */}
            <div className="text-white p-1 md:p-4 rounded-2xl shadow-2xl w-full max-w-7xl mx-auto relative overflow-hidden">
                {/* Decorative background elements for visual flair */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-700 opacity-20 rounded-full mix-blend-lighten filter blur-xl animate-pulse delay-200"></div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg flex items-center justify-center gap-3">
                    <Network size={44} /> User Matrix Network
                </h2>

                {user ? (
                    <>
                        {/* User's Root Node Information Card */}
                        <div className="bg-blue-700/60 border border-blue-500 w-fit mx-auto p-4 sm:p-6 rounded-full shadow-lg text-center mb-10 transform transition-all duration-300 hover:scale-105">
                            <UserCircle
                                size={50}
                                className="mx-auto text-blue-200 drop-shadow-md"
                            />
                            <h3 className="font-extrabold text-xl sm:text-2xl text-yellow-300 mb-1">
                                {user.name || "User Name"}
                            </h3>
                            <p className="text-sm sm:text-base text-blue-100 mb-2 truncate">
                                {user.email || "user@example.com"}
                            </p>
                            <p className="text-sm sm:text-base text-blue-100 mb-2 ">
                                {user.phone || "N/A"}
                            </p>
                            <div className="text-sm sm:text-base text-blue-100 flex-col items-center justify-center gap-4">
                                <p className="flex items-baseline justify-center ">
                                    <Share2 size={16} /> Code:{" "}
                                    <span className="font-mono">
                                        {user.referralCode || "N/A"}
                                    </span>
                                </p>

                                <p className="flex items-baseline justify-center ">
                                    <Award size={16} /> Level:{" "}
                                    <span className="font-semibold">
                                        {user.currentLevel || 0}
                                    </span>
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
                                                <div
                                                    key={child._id || index}
                                                    className="relative flex flex-col items-center"
                                                >
                                                    {/* Vertical line from horizontal connector to this specific child */}
                                                    <div className="absolute -top-4 h-4 w-0.5 bg-gray-600 z-0 transform -translate-x-1/2"></div>
                                                    {/* Pass levelColors to TreeNode if it's not imported there */}
                                                    <TreeNode user={child} levelColors={levelColors} />{" "}
                                                    {/* Render each top-level child node */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-800/40 border border-blue-600 rounded-lg p-8 text-blue-200 text-center text-lg animate-fadeIn shadow-inner w-full">
                                        <p className="mb-4">This user has no direct downline in the matrix!</p>
                                        <p>Encourage them to grow their network.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-blue-300 text-center py-12 text-xl font-semibold">
                        No user data to display.
                    </div>
                )}
            </div>
        </div>
    );
}

export default MatrixViewer;