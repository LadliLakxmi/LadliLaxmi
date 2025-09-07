// src/components/UpdateProfileForm.jsx (or wherever your components are)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, UserCircle, Save } from 'lucide-react'; // Lucide icons for close, user, save

const UpdateProfileForm = ({ user, onClose, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panCard, setPanCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Populate form fields with current user data when component mounts or user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setPanCard(user.panCard || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token'); // Get token from localStorage

    try {
      const response = await axios.put(
        `https://ladlilakshmi.onrender.com/api/v1/profile/update-profile`, // Ensure this matches your backend route
        { name, email, phone,panCard },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message || 'Profile updated successfully!');
      // Call the callback to update parent state (e.g., re-fetch user data on Dashboard)
      if (onProfileUpdated) {
        onProfileUpdated(response.data.user); // Pass updated user data
      }
      // Optionally close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <UserCircle size={28} className="text-blue-600" /> Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!!user?.name}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!user?.email}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={!!user?.phone}
            />
          </div>
          <div>
            <label htmlFor="panCard" className="block text-sm font-medium text-gray-700 mb-1">
              Pan Card
            </label>
            <input
              type="text" // Use type="tel" for phone numbers
              id="panCard"
              className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={panCard}
              onChange={(e) => setPanCard(e.target.value)}
              required
              disabled={!!user?.panCard}
            />
          </div>

          {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2 text-center">{success}</p>}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-white rounded-full"></span>
                Updating...
              </>
            ) : (
              <>
                <Save size={20} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileForm;
