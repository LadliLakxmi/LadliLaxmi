// // ===== UpdateUser.js =====
// import React, { useState } from 'react';
// import axios from 'axios';

// const UpdateUser = () => {
//   const [userEmail, setUserEmail] = useState(''); // Input for fetching user by email
//   const [userIdToUpdate, setUserIdToUpdate] = useState(''); // Stores the _id obtained after fetching by email
//   const [userData, setUserData] = useState(null); // Full user data after fetch
//   const [formData, setFormData] = useState({ // Form fields for updating
//     name: '',
//     email: '', // This will be the user's current email from fetched data
//     phone: '',
//     password: '', // New password (empty by default)
//     referralCode: '',
//     referredBy: '',
//     sponserdBy: '',
//     currentLevel: 0,
//     walletBalance: 0,
//     blockedForUpgrade: 0,
//     totalWithdrawn: 0,
//     accountNumber: '',
//     accountHolder: '',
//     bankName: '',
//     ifscCode: '',
//     role: 'user',
//     isActive: true,
//   });
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const API_BASE_URL = 'https://ladlilaxmi.onrender.com/api/v1/admin'; // Adjust if different

//   // Helper for authenticated requests
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('token'); // Ensure your admin token is stored here
//     return {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//   };

//   // Function to fetch user details by Email ID
//   const handleFetchUserByEmail = async () => {
//     if (!userEmail) {
//       setError('Please enter a user email.');
//       setUserData(null);
//       setUserIdToUpdate('');
//       return;
//     }
//     setError('');
//     setMessage('');
//     try {
//       const response = await axios.get(`${API_BASE_URL}/users/by-email?email=${userEmail}`, getAuthHeaders());
//       const fetchedUser = response.data;

//       setUserData(fetchedUser); // Store the full user data
//       setUserIdToUpdate(fetchedUser._id); // Crucially, store the _id for subsequent update

//       // Populate form data with fetched user details
//       setFormData({
//         name: fetchedUser.name || '',
//         email: fetchedUser.email || '',
//         phone: fetchedUser.phone || '',
//         password: '', // Always clear password field on fetch for security
//         referralCode: fetchedUser.referralCode || '',
//         referredBy: fetchedUser.referredBy || '',
//         sponserdBy: fetchedUser.sponserdBy || '',
//         currentLevel: fetchedUser.currentLevel || 0,
//         walletBalance: fetchedUser.walletBalance || 0,
//         blockedForUpgrade: fetchedUser.blockedForUpgrade || 0,
//         totalWithdrawn: fetchedUser.totalWithdrawn || 0,
//         // Populate bank details (handle potential null/undefined bankDetails)
//         accountNumber: fetchedUser.bankDetails?.accountNumber || '',
//         accountHolder: fetchedUser.bankDetails?.accountHolder || '',
//         bankName: fetchedUser.bankDetails?.bankName || '',
//         ifscCode: fetchedUser.bankDetails?.ifscCode || '',
//         role: fetchedUser.role || 'user',
//         isActive: fetchedUser.isActive,
//       });
//       setMessage(`User "${fetchedUser.name}" details fetched successfully!`);
//     } catch (err) {
//       console.error('Error fetching user by email:', err);
//       setError(err.response?.data?.message || 'Failed to fetch user. Please check the email and try again.');
//       setUserData(null);
//       setUserIdToUpdate('');
//       // Reset form data on error
//       setFormData({
//         name: '', email: '', phone: '', password: '', referralCode: '', referredBy: '', sponserdBy: '',
//         currentLevel: 0, walletBalance: 0, blockedForUpgrade: 0, totalWithdrawn: 0,
//         accountNumber: '', accountHolder: '', bankName: '', ifscCode: '',
//         role: 'user', isActive: true,
//       });
//     }
//   };

//   // Handle changes in form inputs
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     // Handle nested bankDetails fields
//     if (name.startsWith('bankDetails.')) {
//       const bankDetailKey = name.split('.')[1];
//       setFormData(prevData => ({
//         ...prevData,
//         bankDetails: {
//           ...prevData.bankDetails, // Maintain existing bankDetails if any
//           [bankDetailKey]: value,
//         }
//       }));
//     } else {
//       setFormData(prevData => ({
//         ...prevData,
//         [name]: type === 'checkbox' ? checked : value,
//       }));
//     }
//   };

//   // Handle form submission for updating user
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     if (!userIdToUpdate) {
//       setError('Please fetch a user by email before attempting to update.');
//       return;
//     }

//     // Construct the payload for the PUT request
//     const updatePayload = {
//       name: formData.name,
//       email: formData.email,
//       phone: formData.phone,
//       currentLevel: parseInt(formData.currentLevel, 10), // Ensure number type
//       walletBalance: parseFloat(formData.walletBalance), // Ensure number type
//       blockedForUpgrade: parseInt(formData.blockedForUpgrade, 10),
//       totalWithdrawn: parseFloat(formData.totalWithdrawn),
//       role: formData.role,
//       isActive: formData.isActive,
//       // Only include password if it's been typed into
//       ...(formData.password && { password: formData.password }),
//       // Send bank details as a complete object
//       bankDetails: {
//         accountNumber: formData.accountNumber,
//         accountHolder: formData.accountHolder,
//         bankName: formData.bankName,
//         ifscCode: formData.ifscCode,
//       },
//       referralCode: formData.referralCode,
//       referredBy: formData.referredBy,
//       sponserdBy: formData.sponserdBy,
//     };

//     try {
//       // Use the fetched userIdToUpdate in the PUT request URL
//       const response = await axios.put(`${API_BASE_URL}/users/${userIdToUpdate}`, updatePayload, getAuthHeaders());
//       console.log("update response",response)
//       setMessage(response.data.message || 'User updated successfully!');
//       // Optionally re-fetch user details to show immediate updates
//     //   handleFetchUserByEmail();
//     } catch (err) {
//       console.error('Error updating user:', err);
//       setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update user.');
//     }
//   };

//   return (
//     <div  style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
//       <h2>Update User Details (Admin Panel)</h2>

//       {/* Section to fetch user by email */}
//       <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
//         <h3>1. Find User by Email</h3>
//         <input
//           type="email"
//           placeholder="Enter User Email ID"
//           value={userEmail}
//           onChange={(e) => setUserEmail(e.target.value)}
//           style={{ padding: '8px', marginRight: '10px', width: '250px' }}
//         />
//         <button onClick={handleFetchUserByEmail} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
//           Fetch User
//         </button>
//         {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
//         {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
//       </div>

//       {/* Form to update user data (only visible after a user is fetched) */}
//       {userData && (
//         <form onSubmit={handleSubmit} className='no-spinner' style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px' }}>
//           <h3>2. Update Data for: {userData.name} ({userData.email})</h3>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//             {/* Basic Info */}
//             <div>
//               <label>Name:</label>
//               <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Email:</label>
//               <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Phone:</label>
//               <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>New Password (leave blank to keep current):</label>
//               <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>

//             {/* Referral Info */}
//             <div>
//               <label>Referral Code:</label>
//               <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Referred By:</label>
//               <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Sponsored By:</label>
//               <input type="text" name="sponserdBy" value={formData.sponserdBy} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>

//             {/* Financial/Level Info */}
//             <div className='no-spinner'>
//               <label>Current Level:</label>
//               <input type="number" name="currentLevel" value={formData.currentLevel} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Wallet Balance:</label>
//               <input type="number" name="walletBalance" value={formData.walletBalance} onChange={handleChange} step="0.01" style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Blocked For Upgrade:</label>
//               <input type="number" name="blockedForUpgrade" value={formData.blockedForUpgrade} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//             </div>
//             <div>
//               <label>Total Withdrawn:</label>
//               <input type="number" name="totalWithdrawn" value={formData.totalWithdrawn} onChange={handleChange} step="0.01" style={{ width: '100%', padding: '8px' }} />
//             </div>

//             {/* Bank Details */}
//             <div style={{ gridColumn: 'span 2', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
//               <h4>Bank Details</h4>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                 <div>
//                   <label>Account Number:</label>
//                   <input type="text" name="bankDetails.accountNumber" value={formData.accountNumber} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//                 </div>
//                 <div>
//                   <label>Account Name:</label>
//                   <input type="text" name="bankDetails.accountHolder" value={formData.accountHolder} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//                 </div>
//                 <div>
//                   <label>Bank Name:</label>
//                   <input type="text" name="bankDetails.bankName" value={formData.bankName} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//                 </div>
//                 <div>
//                   <label>IFSC Code:</label>
//                   <input type="text" name="bankDetails.ifscCode" value={formData.ifscCode} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
//                 </div>
//               </div>
//             </div>

//             {/* Role & Active Status */}
//             <div>
//               <label>Role:</label>
//               <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
//                 <option value="user">User</option>
//                 <option value="Admin">Admin</option>
//               </select>
//             </div>
//             <div>
//               <label>Is Active:</label>
//               <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginLeft: '10px' }} />
//             </div>
//           </div>

//           <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
//             Update User
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default UpdateUser;

// ===== UpdateUser.js =====
import React, { useState } from 'react';
import axios from 'axios';

const UpdateUser = () => {
  const [userEmail, setUserEmail] = useState(''); // Input for fetching user by email
  const [userIdToUpdate, setUserIdToUpdate] = useState(''); // Stores the _id obtained after fetching by email
  const [userData, setUserData] = useState(null); // Full user data after fetch
  const [formData, setFormData] = useState({ // Form fields for updating
    name: '',
    email: '', // This will be the user's current email from fetched data
    phone: '',
    password: '', // New password (empty by default)
    referralCode: '',
    referredBy: '', // This will hold the referral code string from the fetched user
    sponserdBy: '', // This will hold the sponsor ID string from the fetched user
    currentLevel: 0,
    walletBalance: 0,
    sponserwalletBalance: 0,
    totalWithdrawn: 0,
    accountNumber: '',
    accountHolder: '',
    bankName: '',
    ifscCode: '',
    role: 'user',
    isActive: true,
  });

  // NEW STATE for displaying referredBy and sponserdBy emails/names
  const [referredByEmailDisplay, setReferredByEmailDisplay] = useState('');
  const [sponserdByEmailDisplay, setSponserdByEmailDisplay] = useState('');
  const [sponserdByNameDisplay, setSponserdByNameDisplay] = useState(''); // Optionally display sponsor name

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = 'https://ladlilaxmi.onrender.com/api/v1/admin'; // Adjust if different

  // Helper for authenticated requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Ensure your admin token is stored here
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Function to fetch user details by Email ID
  const handleFetchUserByEmail = async () => {
    if (!userEmail) {
      setError('Please enter a user email.');
      setUserData(null);
      setUserIdToUpdate('');
      // Clear display fields if no email
      setReferredByEmailDisplay('');
      setSponserdByEmailDisplay('');
      setSponserdByNameDisplay('');
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/by-email?email=${userEmail}`, getAuthHeaders());
      const fetchedUser = response.data; // This now contains referredByEmail, sponserdByEmail, sponserdByName
    console.log("Update response: ",fetchedUser)
      setUserData(fetchedUser); // Store the full user data
      setUserIdToUpdate(fetchedUser._id); // Crucially, store the _id for subsequent update

      // Set the display states from the new fields returned by the backend
      setReferredByEmailDisplay(fetchedUser.referredByEmail || 'N/A');
      setSponserdByEmailDisplay(fetchedUser.sponserdByEmail || 'N/A');
      setSponserdByNameDisplay(fetchedUser.sponserdByName || 'N/A');


      // Populate form data with fetched user details
      setFormData({
        name: fetchedUser.name || '',
        email: fetchedUser.email || '',
        phone: fetchedUser.phone || '',
        password: '', // Always clear password field on fetch for security
        referralCode: fetchedUser.referralCode || '',
        referredBy: fetchedUser.referredBy || '', // This is the original referral code string for update
        sponserdBy: fetchedUser.sponserdBy || '', // This is the original sponsor ID string for update
        currentLevel: fetchedUser.currentLevel || 0,
        walletBalance: fetchedUser.walletBalance || 0,
        totalWithdrawn: fetchedUser.totalWithdrawn || 0,
        sponserwalletBalance: fetchedUser.sponserwalletBalance || 0,
        // Populate bank details (handle potential null/undefined bankDetails)
        accountNumber: fetchedUser.bankDetails?.accountNumber || '',
        accountHolder: fetchedUser.bankDetails?.accountHolder || '',
        bankName: fetchedUser.bankDetails?.bankName || '',
        ifscCode: fetchedUser.bankDetails?.ifscCode || '',
        role: fetchedUser.role || 'user',
        isActive: fetchedUser.isActive,
      });
      setMessage(`User "${fetchedUser.name}" details fetched successfully!`);
    } catch (err) {
      console.error('Error fetching user by email:', err);
      setError(err.response?.data?.message || 'Failed to fetch user. Please check the email and try again.');
      setUserData(null);
      setUserIdToUpdate('');
      // Reset display fields on error
      setReferredByEmailDisplay('');
      setSponserdByEmailDisplay('');
      setSponserdByNameDisplay('');
      // Reset form data on error
      setFormData({
        name: '', email: '', phone: '', password: '', referralCode: '', referredBy: '', sponserdBy: '',
        currentLevel: 0, walletBalance: 0, totalWithdrawn: 0,sponserwalletBalance: 0,
        accountNumber: '', accountHolder: '', bankName: '', ifscCode: '',
        role: 'user', isActive: true,
      });
    }
  };

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested bankDetails fields
    if (name.startsWith('bankDetails.')) {
      const bankDetailKey = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        bankDetails: {
          ...prevData.bankDetails, // Maintain existing bankDetails if any
          [bankDetailKey]: value,
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Handle form submission for updating user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!userIdToUpdate) {
      setError('Please fetch a user by email before attempting to update.');
      return;
    }

    // Construct the payload for the PUT request
    const updatePayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      currentLevel: parseInt(formData.currentLevel, 10), // Ensure number type
      walletBalance: parseFloat(formData.walletBalance), // Ensure number type
      totalWithdrawn: parseFloat(formData.totalWithdrawn),
      sponserwalletBalance: parseFloat(formData.sponserwalletBalance), // Ensure number type
      role: formData.role,
      isActive: formData.isActive,
      // Only include password if it's been typed into
      ...(formData.password && { password: formData.password }),
      // Send bank details as a complete object
      bankDetails: {
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
      },
      referralCode: formData.referralCode,
      referredBy: formData.referredBy, // Send referral code string as is for update
      sponserdBy: formData.sponserdBy, // Send sponsor ID string as is for update
    };

    try {
      // Use the fetched userIdToUpdate in the PUT request URL
      const response = await axios.put(`${API_BASE_URL}/users/${userIdToUpdate}`, updatePayload, getAuthHeaders());
      console.log("update response",response)
      setMessage(response.data.message || 'User updated successfully!');
      // Optionally re-fetch user details to show immediate updates
    //   handleFetchUserByEmail(); // commented out as per previous interaction, but useful for refresh
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update user.');
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto font-sans bg-gray-900 text-white min-h-screen"> {/* Added bg-gray-900 and min-h-screen */}
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Update User Details (Admin Panel)</h2>

      {/* Section to fetch user by email */}
      <div className="mb-8 border border-gray-700 p-6 rounded-lg shadow-lg bg-gray-800"> {/* Darker background, stronger border */}
        <h3 className="text-xl font-semibold mb-4 text-gray-100">1. Find User by Email</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="email"
            placeholder="Enter User Email ID"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="flex-1 p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            onClick={handleFetchUserByEmail}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 ease-in-out w-full sm:w-auto"
          >
            Fetch User
          </button>
        </div>
        {error && <p className="text-red-400 mt-3">{error}</p>} {/* Lighter red for dark background */}
        {message && <p className="text-green-400 mt-3">{message}</p>} {/* Lighter green for dark background */}
      </div>

      {/* Form to update user data (only visible after a user is fetched) */}
      {userData && (
        <form onSubmit={handleSubmit} className="border border-blue-600 p-6 rounded-lg shadow-lg bg-gray-800"> {/* Darker background */}
          <h3 className="text-xl font-semibold mb-6 text-gray-100">2. Update Data for: {userData.name} ({userData.email})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Basic Info */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name:</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email:</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone:</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password (leave blank to keep current):</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>

            {/* Referral Info */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-1">Referral Code:</label>
              <input type="text" id="referralCode" name="referralCode" value={formData.referralCode} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            {/* Display Referred By Email (fetched from backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Referred By (Email):</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">
                {referredByEmailDisplay}
              </p>
            </div>
            {/* Display Sponsored By Email (fetched from backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sponsored By (Email):</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">
                {sponserdByEmailDisplay}
              </p>
            </div>
            {/* Display Sponsored By Name (fetched from backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sponsored By (Name):</label>
              <p className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200">
                {sponserdByNameDisplay}
              </p>
            </div>
            {/* Keep the original 'referredBy' and 'sponserdBy' inputs hidden for submission logic
                if you don't want the admin to directly edit the ID/code, only view the emails */}
            <div className="hidden">
              <label htmlFor="referredBy" className="block text-sm font-medium text-gray-300 mb-1">Original Referred By:</label>
              <input type="text" id="referredBy" name="referredBy" value={formData.referredBy} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>
            <div className="hidden">
              <label htmlFor="sponserdBy" className="block text-sm font-medium text-gray-300 mb-1">Original Sponsored By:</label>
              <input type="text" id="sponserdBy" name="sponserdBy" value={formData.sponserdBy} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" />
            </div>


            {/* Financial/Level Info - Applying no-spinner and min="0" */}
            <div>
              <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-300 mb-1">Current Level:</label>
              <input type="number" id="currentLevel" name="currentLevel" value={formData.currentLevel} onChange={handleChange} min="0" className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-300 mb-1">Wallet Balance:</label>
              <input type="number" id="walletBalance" name="walletBalance" value={formData.walletBalance} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="sponserwalletBalance" className="block text-sm font-medium text-gray-300 mb-1">Sponser Wallet Balance:</label>
              <input type="number" id="sponserwalletBalance" name="sponserwalletBalance" value={formData.sponserwalletBalance} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>
            <div>
              <label htmlFor="totalWithdrawn" className="block text-sm font-medium text-gray-300 mb-1">Total Withdrawn:</label>
              <input type="number" id="totalWithdrawn" name="totalWithdrawn" value={formData.totalWithdrawn} onChange={handleChange} step="0.01" min="0" className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 no-spinner bg-gray-700 text-white" />
            </div>

            {/* Bank Details */}
            {/* Bank Details */}
<div className="col-span-1 md:col-span-2 border-t pt-4 mt-4 border-gray-700">
  <h4 className="text-lg font-semibold mb-4 text-gray-100">Bank Details</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
    <div>
      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-1">Account Number:</label>
      <input 
        type="text" 
        id="accountNumber" 
        name="accountNumber" 
        value={formData.accountNumber} 
        onChange={handleChange} 
        className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" 
      />
    </div>
    <div>
      <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-300 mb-1">Account Name:</label>
      <input 
        type="text" 
        id="accountHolder" 
        name="accountHolder"  
        value={formData.accountHolder} 
        onChange={handleChange} 
        className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" 
      />
    </div>
    <div>
      <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">Bank Name:</label>
      <input 
        type="text" 
        id="bankName" 
        name="bankName" 
        value={formData.bankName} 
        onChange={handleChange} 
        className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" 
      />
    </div>
    <div>
      <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-300 mb-1">IFSC Code:</label>
      <input 
        type="text" 
        id="ifscCode" 
        name="ifscCode" 
        value={formData.ifscCode} 
        onChange={handleChange} 
        className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white" 
      />
    </div>
  </div>
</div>

            {/* Role & Active Status */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role:</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white">
                <option value="user">User</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-700" />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-300">Is Active</label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200 ease-in-out shadow-md"
          >
            Update User
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateUser;
