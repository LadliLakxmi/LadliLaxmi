// src/services/operations/donationOperations.js
import { toast } from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance'; // Corrected import: use the default export

// Define your API endpoints specific to donations
const DONATION_ENDPOINTS = {
  CAPTURE_PAYMENT_API: '/donations/create-order',
  VERIFY_PAYMENT_API: '/donations/verify-payment',
};
const token = localStorage.getItem("token"); // ✅ define token here
// Function to create a Razorpay order in the backend
export const createDonationOrder = async (levelId, id , token) => {
  const toastId = toast.loading('Creating order...');
  let result = { success: false, message: "Failed to create order" };
  try {
    const response = await axiosInstance( // Changed from apiConnector to axiosInstance
      {
        method: 'POST',
        url: DONATION_ENDPOINTS.CAPTURE_PAYMENT_API,
        data: { currentLevel: levelId },
        // data: { userId: id, currentLevel: levelId },
        // Your interceptor automatically adds the token if present in localStorage.
        // However, if you explicitly want to pass it or ensure it's there for this specific call,
        // you can include it here:
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    result = { success: true, data: response.data };
  } catch (error) {
    console.error('CREATE_DONATION_ORDER_API ERROR:', error);
    result.message = error.response?.data?.message || 'Failed to create order.';
  } finally {
    toast.dismiss(toastId);
  }
  return result;
};

// Function to verify the payment with the backend (Updated)
export const verifyDonationPayment = async (paymentData , id , token) => {
  const toastId = toast.loading('Verifying payment...');
  let result = { success: false, message: "Payment verification failed" };
  try {
    const response = await axiosInstance(
      {
        method: 'POST',
        url: DONATION_ENDPOINTS.VERIFY_PAYMENT_API, // This points to the new /donations/verify-payment
        data: { razorpay_order_id:paymentData.razorpay_order_id,
           razorpay_payment_id:paymentData.razorpay_payment_id
            , razorpay_signature:paymentData.razorpay_signature,
            currentLevel:paymentData.currentLevel
 }, // Contains razorpay_payment_id, order_id, signature, currentLevel
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Backend now returns updated user data in `response.data.data`
    result = { success: true, data: response.data.data };
  } catch (error) {
    console.error('VERIFY_DONATION_PAYMENT_API ERROR:', error);
    result.message = error.response?.data?.message || 'Payment verification failed.';
  } finally {
    toast.dismiss(toastId);
  }
  return result;
};

// You can keep other functions like getDonationHistory if needed
export const getDonationHistory = async (token) => {
  const toastId = toast.loading('Fetching donation history...');
  let result = [];
  try {
    const response = await axiosInstance( // Changed from apiConnector to axiosInstance
      {
        method: 'GET',
        url: '/donations/history',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.error('GET_DONATION_HISTORY_API ERROR:', error);
    toast.error('Failed to fetch donation history.');
  } finally {
    toast.dismiss(toastId);
  }
  return result;
};