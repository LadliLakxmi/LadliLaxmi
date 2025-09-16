import React, { useState } from 'react';
import axios from 'axios';

const UpdateUser = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userIdToUpdate, setUserIdToUpdate] = useState('');
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: '',
    referredBy: '',
    sponserdBy: '',
    currentLevel: 0,
    walletBalance: 0,
    upgradewalletBalance: 0,
    totalWithdrawn: 0,
    accountNumber: '',
    accountHolder: '',
    bankName: '',
    panCard:undefined,
    ifscCode: '',
    upiId: '',
    role: 'user',
    isActive: true,
  });

  // Sponsor and referral display info (read-only)
  const [referredByEmailDisplay, setReferredByEmailDisplay] = useState('');
  const [sponserdByEmailDisplay, setSponserdByEmailDisplay] = useState('');
  const [sponserdByNameDisplay, setSponserdByNameDisplay] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Admin password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const API_BASE_URL = 'https://ladlilakshmi.onrender.com/api/v1/admin';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch user by email and populate states, including display fields
  const handleFetchUserByEmail = async () => {
    if (!userEmail) {
      setError('Please enter a user email.');
      setUserData(null);
      setUserIdToUpdate('');
      setMessage('');
      setReferredByEmailDisplay('');
      setSponserdByEmailDisplay('');
      setSponserdByNameDisplay('');
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await axios.get(
        `${API_BASE_URL}/users/by-email?email=${userEmail}`,
        getAuthHeaders()
      );
      const fetchedUser = res.data;
      setUserData(fetchedUser);
      setUserIdToUpdate(fetchedUser._id);
      setReferredByEmailDisplay(fetchedUser.referredByEmail || 'N/A');
      setSponserdByEmailDisplay(fetchedUser.sponserdByEmail || 'N/A');
      setSponserdByNameDisplay(fetchedUser.sponserdByName || 'N/A');
      setFormData({
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        password: '',
        referralCode: fetchedUser.referralCode || '',
        referredBy: fetchedUser.referredBy || '',
        sponserdBy: fetchedUser.sponserdBy || '',
        panCard: fetchedUser.panCard || undefined,
        currentLevel: fetchedUser.currentLevel || 0,
        walletBalance: fetchedUser.walletBalance || 0,
        totalWithdrawn: fetchedUser.totalWithdrawn || 0,
        upgradewalletBalance: fetchedUser.upgradewalletBalance || 0,
        accountNumber: fetchedUser.bankDetails?.accountNumber || '',
        accountHolder: fetchedUser.bankDetails?.accountHolder || '',
        bankName: fetchedUser.bankDetails?.bankName || '',
        ifscCode: fetchedUser.bankDetails?.ifscCode || '',
        upiId: fetchedUser.bankDetails?.upiId || '',
        role: fetchedUser.role || 'user',
        isActive: fetchedUser.isActive,
      });
      setMessage(`User "${fetchedUser.name}" details fetched successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user.');
      setUserData(null);
      setUserIdToUpdate('');
      setReferredByEmailDisplay('');
      setSponserdByEmailDisplay('');
      setSponserdByNameDisplay('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        referralCode: '',
        referredBy: '',
        sponserdBy: '',
        panCard:undefined,
        currentLevel: 0,
        walletBalance: 0,
        totalWithdrawn: 0,
        upgradewalletBalance: 0,
        accountNumber: '',
        accountHolder: '',
        bankName: '',
        ifscCode: '',
        upiId: '',
        role: 'user',
        isActive: true,
      });
    }
  };

  // Handle input changes, including checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Show modal on update button click
  const handleShowPasswordModal = (e) => {
    e.preventDefault();
    setAdminPasswordInput('');
    setAdminPasswordError('');
    setShowPasswordModal(true);
  };

  // Submit update with admin password verification
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setAdminPasswordError('Please enter your password.');
      return;
    }
    setIsUpdating(true);
    setAdminPasswordError('');
    setError('');
    setMessage('');
    const updatePayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      currentLevel: parseInt(formData.currentLevel, 10) || 0,
      walletBalance: parseFloat(formData.walletBalance) || 0,
      totalWithdrawn: parseFloat(formData.totalWithdrawn) || 0,
      upgradewalletBalance: parseFloat(formData.upgradewalletBalance) || 0,
      role: formData.role,
      isActive: formData.isActive,
      bankDetails: {
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId,
      },
      panCard: formData.panCard || undefined,
      referralCode: formData.referralCode,
      referredBy: formData.referredBy,
      sponserdBy: formData.sponserdBy,
      adminPassword: adminPasswordInput, // Admin password verification
    };
    if (formData.password) updatePayload.password = formData.password;
    if (!userIdToUpdate) {
      setError('Please fetch a user before updating.');
      setShowPasswordModal(false);
      setIsUpdating(false);
      return;
    }
    try {
      const res = await axios.put(`${API_BASE_URL}/users/${userIdToUpdate}`, updatePayload, getAuthHeaders());
      setMessage(res.data.message || 'User updated successfully!');
      setShowPasswordModal(false);
    } catch (err) {
      setAdminPasswordError(
        err.response?.data?.message || 'Update failed. Possible incorrect admin password.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto font-sans bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Update User Details (Admin Panel)</h2>

      {/* Fetch user by email */}
      <div className="mb-8 border border-gray-700 p-6 rounded-lg shadow-lg bg-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-gray-100">1. Find User by Email</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="email"
            placeholder="Enter User Email ID"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            onClick={handleFetchUserByEmail}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
          >
            Fetch User
          </button>
        </div>
        {error && <p className="text-red-400 mt-3">{error}</p>}
        {message && <p className="text-green-400 mt-3">{message}</p>}
      </div>

      {/* Update form */}
      {userData && (
        <form onSubmit={handleShowPasswordModal} className="border border-blue-600 p-6 rounded-lg shadow-lg bg-gray-800">
          <h3 className="text-xl font-semibold mb-6 text-gray-100">
            2. Update Data for: {userData.name} ({userData.email})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Basic Info */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone:</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password (leave blank to keep current):
              </label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>

            {/* Referral and Sponsor Info */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-1">Referral Code:</label>
              <input type="text" id="referralCode" name="referralCode" value={formData.referralCode} onChange={handleChange} required
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="referredBy" className="block text-sm font-medium text-gray-300 mb-1">Referred By (ID):</label>
              <input type="text" id="referredBy" name="referredBy" value={formData.referredBy} onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="sponserdBy" className="block text-sm font-medium text-gray-300 mb-1">Sponsored By (ID):</label>
              <input type="text" id="sponserdBy" name="sponserdBy" value={formData.sponserdBy} onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="panCard" className="block text-sm font-medium text-gray-300 mb-1">Pan Card:</label>
              <input type="text" id="panCard" name="panCard" value={formData.panCard} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>

            {/* Display sponsor emails and name (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Referred By Email:</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">{referredByEmailDisplay}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sponsored By Email:</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">{sponserdByEmailDisplay}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sponsored By Name:</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">{sponserdByNameDisplay}</p>
            </div>

            {/* Financial / Level Info */}
            <div>
              <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-300 mb-1">Current Level:</label>
              <input type="number" id="currentLevel" name="currentLevel" value={formData.currentLevel} onChange={handleChange} min="0"
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-300 mb-1">Wallet Balance:</label>
              <input type="number" id="walletBalance" name="walletBalance" value={formData.walletBalance} onChange={handleChange} step="0.01" min="0"
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="upgradewalletBalance" className="block text-sm font-medium text-gray-300 mb-1">Upgrade Wallet Balance:</label>
              <input type="number" id="upgradewalletBalance" name="upgradewalletBalance" value={formData.upgradewalletBalance} onChange={handleChange} step="0.01" min="0"
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="totalWithdrawn" className="block text-sm font-medium text-gray-300 mb-1">Total Withdrawn:</label>
              <input type="number" id="totalWithdrawn" name="totalWithdrawn" value={formData.totalWithdrawn} onChange={handleChange} step="0.01" min="0"
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>

            {/* Bank Details */}
            <div className="col-span-1 md:col-span-2 border-t pt-4 mt-4 border-gray-700">
              <h4 className="text-lg font-semibold mb-4 text-gray-100">Bank Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">Account Number:</label>
                  <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-300 mb-1">Account Name:</label>
                  <input type="text" id="accountHolder" name="accountHolder" value={formData.accountHolder} onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">Bank Name:</label>
                  <input type="text" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-300 mb-1">IFSC Code:</label>
                  <input type="text" id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
                </div>
                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-300 mb-1">UPI ID:</label>
                  <input type="text" id="upiId" name="upiId" value={formData.upiId} onChange={handleChange}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
                </div>
              </div>
            </div>

            {/* Role & Active */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role:</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white">
                <option value="user">User</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700" />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-300">Is Active</label>
            </div>
          </div>

          <button type="submit"
            className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200">
            Update User
          </button>
        </form>
      )}

      {/* Admin Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button onClick={() => setShowPasswordModal(false)}
              className="absolute right-3 top-3 text-gray-700 hover:text-red-500 font-bold">×</button>
            <h3 className="text-xl font-semibold mb-6 text-center">Admin Password Required</h3>
            <form onSubmit={handleUpdateUser}>
              <input type="password" placeholder="Enter your admin password" value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value.trim())} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none"
                required autoFocus />
              {adminPasswordError && <p className="text-red-500 mb-4 text-center">{adminPasswordError}</p>}
              <button type="submit" disabled={isUpdating}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition">
                {isUpdating ? 'Updating...' : 'Confirm Update'}
              </button>
            </form>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mt-3">{error}</p>}
      {message && <p className="text-green-400 mt-3">{message}</p>}
    </div>
  );
};

export default UpdateUser;
