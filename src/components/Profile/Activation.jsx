// src/pages/Activation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createDonationOrder,
  verifyDonationPayment,
} from "../../services/operations/donationOperations";
import { LEVELS_CONFIG_FRONTEND } from "../../config/levelsConfigFrontend";

// Placeholder for your Razorpay logo
import rzpLogo from "../../assets/Logo.jpeg";
import QRcode from "../../assets/QRcode.jpg";

// function loadScript(src) {
//   return new Promise((resolve) => {
//     const script = document.createElement('script');
//     script.src = src;
//     script.onload = () => {
//       resolve(true);
//     };
//     script.onerror = () => {
//       resolve(false);
//     };
//     document.body.appendChild(script);
//   });
// }

// const Activation = () => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState(() => {
//     try {
//       const storedUser = localStorage.getItem('user');
//       return storedUser ? JSON.parse(storedUser) : null;
//     } catch (e) {
//       console.error("Failed to parse user from localStorage", e);
//       return null;
//     }
//   });
//   console.log("user: ", user);

//   const [token, setToken] = useState(() => localStorage.getItem('token') || null);

//   const [loading, setLoading] = useState(false);
//   const [selectedLevelId, setSelectedLevelId] = useState(null);

//   const levels = Object.keys(LEVELS_CONFIG_FRONTEND).map(key => ({
//     id: parseInt(key, 10),
//     ...LEVELS_CONFIG_FRONTEND[key]
//   }));

//   useEffect(() => {
//     const handleStorageChange = () => {
//       try {
//         const storedUser = localStorage.getItem('user');
//         const storedToken = localStorage.getItem('token');
//         setUser(storedUser ? JSON.parse(storedUser) : null);
//         setToken(storedToken || null);
//       } catch (e) {
//         console.error("Error reading from localStorage:", e);
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);

//   // Corrected: handleLevelActivation now directly receives levelId
//   const handleLevelActivation = async (levelId) => {
//     if (!user || !token) {
//       toast.error("Please log in to activate levels.");
//       navigate('/account');
//       return;
//     }

//     setLoading(true);
//     setSelectedLevelId(levelId);
//     const toastId = toast.loading('Initiating Level Activation...');

//     try {
//       const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
// console.log("res",res)
//       if (!res) {
//         toast.error('Razorpay SDK failed to load. Check your Internet Connection.');
//         setLoading(false); // Ensure loading is reset
//         setSelectedLevelId(null);
//         toast.dismiss(toastId);
//         return;
//       }

//       // Call backend to create the order, passing the correct levelId
//       const orderResponse = await createDonationOrder(levelId, user._id,token);
//       console.log(orderResponse)
//       if (!orderResponse.success) {
//         throw new Error(orderResponse.message);
//       }

//       const { order } = orderResponse.data;

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         currency: order.currency,
//         amount: `${order.amount}`,
//         order_id: order.id,
//         name: 'Level Earning Platform',
//         description: `Activate Level ${levelId}`,
//         image: rzpLogo,
//         prefill: {
//           name: `${user.firstName} ${user.lastName}`,
//           email: user.email,
//         },

//         handler: async function (response) {
//           console.log("response: ",response);
//           // Explicitly construct the paymentData object to ensure all required fields are passed
//             const paymentDataForBackend = {
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature,
//                 currentLevel: levelId, // Pass currentLevel as part of the data payload
//             };

//             console.log("Payment Data prepared for backend:", paymentDataForBackend); // Debugging line

//             await verifyPaymentHandler(paymentDataForBackend);
//         },
//         modal: {
//           ondismiss: () => {
//             setLoading(false);
//             setSelectedLevelId(null);
//             toast.dismiss(toastId);
//           },
//         },
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();

//       paymentObject.on('payment.failed', function (response) {
//         toast.error('Payment Failed. Please try again.');
//         console.error('Razorpay Payment Failed:', response.error);
//         setLoading(false);
//         setSelectedLevelId(null);
//         toast.dismiss(toastId);
//       });
//     } catch (error) {
//       console.error('Error during level activation:', error);
//       toast.error('Could not activate level. ' + (error.message || 'Please try again.'));
//     } finally {
//       toast.dismiss(toastId);
//       if (loading) setLoading(false);
//       // The `finally` block might sometimes fire before `paymentObject.on` for modal dismiss.
//       // It's often better to handle `setLoading(false)` inside `handler` and `ondismiss`.
//       // For now, let's keep it, but be aware.
//       // setLoading(false);
//       // setSelectedLevelId(null);
//       // toast.dismiss(toastId);
//     }
//   };

//  // verifyPaymentHandler function (remains largely same, just confirms data structure)
//   const verifyPaymentHandler = async (paymentData) => {
//     setLoading(true);
//     const toastId = toast.loading('Verifying Payment...');
//     try {
//       const response = await verifyDonationPayment(paymentData,user._id, token);

//       if (!response.success) {
//         throw new Error(response.message);
//       }

//       toast.success('Level Activated Successfully!');
//       const updatedUser = response.data; // This `data` now contains the updated user object
//       setUser(updatedUser);
//       localStorage.setItem('user', JSON.stringify(updatedUser));

//       navigate('/dashboard/my-levels');
//     } catch (error) {
//       console.error('Error verifying payment:', error);
//       toast.error('Payment verification failed. ' + (error.message || 'Please try again.'));
//     } finally {
//       setLoading(false);
//       toast.dismiss(toastId);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Activate Your Level</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {levels.map((level) => (
//           <div
//             key={level.id}
//             className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between transform transition duration-300 hover:scale-105"
//           >
//             <div>
//               <h2 className="text-2xl font-semibold mb-2 text-blue-700">Level {level.id}</h2>
//               <p className="text-lg text-gray-700 mb-4">Amount: ₹{level.amount}</p>
//               <p className="text-sm text-gray-600 mb-4 text-center">{level.description}</p>
//             </div>
//             {user?.currentLevel >= level.id ? (
//               <button
//                 className="w-full bg-green-500 text-white px-6 py-2 rounded-md cursor-not-allowed opacity-70 mt-4"
//                 disabled
//               >
//                 Activated
//               </button>
//             ) : (
//               <button
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 transition-colors duration-200 mt-4"
//                 // Corrected: Pass level.id directly to handleLevelActivation
//                 onClick={() => handleLevelActivation(level.id)}
//                 disabled={
//                   loading ||
//                   selectedLevelId === level.id ||
//                   (level.id > 1 && user?.currentLevel < level.id - 1)
//                 }
//               >
//                 {loading && selectedLevelId === level.id ? 'Processing...' : 'Activate Now'}
//               </button>
//             )}
//             {level.id > 1 && user?.currentLevel < level.id - 1 && (
//               <p className="text-red-500 text-sm mt-2 text-center">
//                 Activate Level {level.id - 1} first.
//               </p>
//             )}
//           </div>
//         ))}
//       </div>
//       {!user && (
//         <p className="text-center text-red-500 mt-8">Please log in to see and activate levels.</p>
//       )}
//     </div>
//   );
// };

// export default Activation;

const Activation = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="border-b p-4 text-4xl rounded-md">Activation</div>
      <div className="flex flex-col md:flex-row mt-4 gap-10 items-center ">
        <div className="flex flex-col  items-center">
          <img className="p-4 h-[25rem] w-[20rem]" src={QRcode} alt="" />
          <p className="text-7xl p-4 mt-0">
            ☝🏻 <p className="text-xl">Pay Here</p>{" "}
          </p>
        </div>
        <div className="flex flex-col  text-xl gap-4 p-4 px-8">
          <p className="text-red-400 text-2xl ">Instructions-</p>
          <p>After Payment</p>
          <p> Please Send Screen Shot on </p>
          <p className="text-2xl w-full py-4 bg-gray-900 p-2 rounded-2xl">
            WhatsApp<span className="w-20px">:-</span>{" "}
            <strong>+91 78200 09103</strong>{" "}
          </p>
          <p className="text-amber-300">
            Along with Name , Email id & Referral code
          </p>
          <p>It takes upto 12Hr in your</p>
          <p> Level 1 Activation</p>
          <button
        type="button"
        className="p-4 bg-gray-900 text-2xl mt-4 border rounded-lg cursor-pointer hover:scale-90"
        onClick={() => {
          navigate("/userdashboard");
        }}
      >
        Go to DashBoard
      </button>
        </div>
        
      </div>

      
    </div>
  );
};

export default Activation;
