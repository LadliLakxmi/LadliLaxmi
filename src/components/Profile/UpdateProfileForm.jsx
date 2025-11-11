// src/components/UpdateProfileForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, UserCircle, Save, Landmark, Banknote } from "lucide-react"; // ✅ Added Landmark & Banknote
import BankProofUpload from "./BankProofUpload";

const UpdateProfileForm = ({ user, onClose, onProfileUpdated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [panCard, setPanCard] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  const [bankDetails, setBankDetails] = useState(null);
  const [bankError, setBankError] = useState(null);
  const [bankSuccess, setBankSuccess] = useState(null);

  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setPanCard(user.panCard || "");
    }

    if (user && user.bankDetails) {
      setFormData({
        accountHolder: user.bankDetails.accountHolder || "",
        accountNumber: user.bankDetails.accountNumber || "",
        ifscCode: user.bankDetails.ifscCode || "",
        bankName: user.bankDetails.bankName || "",
        upiId: user.bankDetails.upiId || "",
      });

      const hasAnyBankDetail = Object.values(user.bankDetails).some(
        (val) => typeof val === "string" && val.trim() !== ""
      );
      setBankDetails(hasAnyBankDetail ? user.bankDetails : null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBankError(null);
    setBankSuccess(null);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://ladlilakshmi.onrender.com/api/v1/withdraw/save-bank-details",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBankSuccess("✅ Bank details saved successfully!");
      setBankDetails(response.data.bankDetails);
    } catch (err) {
      setBankError(
        err.response?.data?.message || "Failed to save bank details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        "https://ladlilakshmi.onrender.com/api/v1/profile/update-profile",
        { name, email, phone, panCard },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfileSuccess(
        response.data.message || "Profile updated successfully!"
      );
      if (onProfileUpdated) onProfileUpdated(response.data.user);

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setProfileError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="flex lg:flex-row flex-col gap-4 bg-white rounded-lg shadow-xl w-full lg:max-w-[80%] p-6 relative animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* ------------ LEFT SIDE: PROFILE UPDATE ------------ */}
        <div className="lg:w-1/2">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <UserCircle size={28} className="text-blue-600" /> Update Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              disabled={!!user?.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-black block w-full px-3 py-2 border rounded-md"
            />

            {/* EMAIL */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              disabled={!!user?.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-black block w-full px-3 py-2 border rounded-md"
            />

            {/* PHONE */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              disabled={!!user?.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="text-black block w-full px-3 py-2 border rounded-md"
            />

            {/* PAN CARD */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PanCard
            </label>
            <input
              type="text"
              disabled={!!user?.panCard}
              value={panCard}
              onChange={(e) => setPanCard(e.target.value)}
              required
              className="text-black block w-full px-3 py-2 border rounded-md"
            />

            {profileError && (
              <p className="text-red-600 text-sm text-center">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-green-600 text-sm text-center">
                {profileSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </button>
          </form>
          <div className="mt-8">
            <BankProofUpload
              userId={user._id}
              currentProofUrl={user?.bankDetails?.bankProof?.url}
              currentStatus={user?.bankProofVerified}
            />
          </div>
        </div>

        {/* ------------ RIGHT SIDE: BANK / KYC ------------ */}
        <div className="lg:w-1/2 flex flex-col items-center p-4 rounded-lg">
          <h2 className="text-black mb-4 text-xl ">
            <strong>KYC</strong>
          </h2>

          <form onSubmit={handleBankFormSubmit} className="space-y-6 w-full">
            {!bankDetails ? (
              <div className="bg-green-700/30 p-5 rounded-lg shadow-inner">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <Landmark size={24} /> Enter Bank Details
                </h3>

                {[
                  "accountHolder",
                  "accountNumber",
                  "ifscCode",
                  "bankName",
                  "upiId",
                ].map((field, i) => (
                  <input
                    key={i}
                    type="text"
                    name={field}
                    value={formData[field]}
                    placeholder={
                      field === "upiId" ? "UPI ID (Optional)" : field
                    }
                    onChange={handleChange}
                    required={field !== "upiId"}
                    className="block w-full px-4 py-2 rounded-md bg-green-900/60 border text-white placeholder-green-200 mb-3"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-yellow-700/30 border border-yellow-600 rounded-lg p-5 text-sm text-black shadow-md">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <Landmark size={24} /> Your Saved Bank Details
                </h3>

                <p>
                  <strong>Account Holder:</strong> {bankDetails.accountHolder}
                </p>
                <p>
                  <strong>Account Number:</strong> {bankDetails.accountNumber}
                </p>
                <p>
                  <strong>IFSC Code:</strong> {bankDetails.ifscCode}
                </p>
                <p>
                  <strong>Bank Name:</strong> {bankDetails.bankName}
                </p>
                {bankDetails.upiId && (
                  <p>
                    <strong>UPI ID:</strong> {bankDetails.upiId}
                  </p>
                )}
              </div>
            )}

            {bankError && (
              <p className="text-red-400 text-center">{bankError}</p>
            )}
            {bankSuccess && (
              <p className="text-green-400 text-center">{bankSuccess}</p>
            )}

            <button
              type="submit"
              disabled={loading || !!bankDetails}
              className={`w-full flex justify-center items-center py-3 rounded-xl shadow-lg text-white gap-2 
    ${
      loading || !!bankDetails
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  {" "}
                  <Banknote size={22} /> Save Bank Details{" "}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileForm;

// // src/components/UpdateProfileForm.jsx (or wherever your components are)
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { X, UserCircle, Save } from 'lucide-react'; // Lucide icons for close, user, save

// const UpdateProfileForm = ({ user, onClose, onProfileUpdated }) => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [panCard, setPanCard] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   // Populate form fields with current user data when component mounts or user prop changes
//   useEffect(() => {
//     if (user) {
//       setName(user.name || '');
//       setEmail(user.email || '');
//       setPhone(user.phone || '');
//       setPanCard(user.panCard || '');
//     }
//   }, [user]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     const token = localStorage.getItem('token'); // Get token from localStorage

//     try {
//       const response = await axios.put(
//         `https://ladlilakshmi.onrender.com/api/v1/profile/update-profile`, // Ensure this matches your backend route
//         { name, email, phone,panCard },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setSuccess(response.data.message || 'Profile updated successfully!');
//       // Call the callback to update parent state (e.g., re-fetch user data on Dashboard)
//       if (onProfileUpdated) {
//         onProfileUpdated(response.data.user); // Pass updated user data
//       }
//       // Optionally close the modal after a short delay
//       setTimeout(() => {
//         onClose();
//       }, 1500);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-scaleIn">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
//           aria-label="Close"
//         >
//           <X size={24} />
//         </button>

//         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
//           <UserCircle size={28} className="text-blue-600" /> Update Profile
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               disabled={!!user?.name}
//             />
//           </div>

//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               disabled={!!user?.email}
//             />
//           </div>

//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//               Phone
//             </label>
//             <input
//               type="tel" // Use type="tel" for phone numbers
//               id="phone"
//               className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               required
//               disabled={!!user?.phone}
//             />
//           </div>
//           <div>
//             <label htmlFor="panCard" className="block text-sm font-medium text-gray-700 mb-1">
//               Pan Card
//             </label>
//             <input
//               type="text" // Use type="tel" for phone numbers
//               id="panCard"
//               className="mt-1 text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               value={panCard}
//               onChange={(e) => setPanCard(e.target.value)}
//               required
//               disabled={!!user?.panCard}
//             />
//           </div>

//           {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
//           {success && <p className="text-green-600 text-sm mt-2 text-center">{success}</p>}

//           <button
//             type="submit"
//             className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-white rounded-full"></span>
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <Save size={20} /> Save Changes
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UpdateProfileForm;
