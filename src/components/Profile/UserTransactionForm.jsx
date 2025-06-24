import React, { useState,useRef } from "react";
import axios from "axios";

const UserTransactionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    Referalcode: "",
    amount: "",
    UTRno: ""
  });
  const [isUtrDuplicate, setIsUtrDuplicate] = useState(false);
  const [utrValidationMessage, setUtrValidationMessage] = useState("");
  const [formMessage, setFormMessage] = useState({ type: "", text: "" }); // { type: 'success' | 'error', text: 'message' }
  const utrCheckTimeoutRef = useRef(null);


   // Function to check UTR number duplication
  const checkUtrDuplication = async (utr) => {
    if (!utr) {
      setIsUtrDuplicate(false);
      setUtrValidationMessage("");
      return;
    }

    try {
      // Assuming you'll add an API endpoint for checking UTR existence
      // For now, we will simulate by fetching all transactions and checking locally.
      // In a real application, you should create a specific backend endpoint
      // like GET /api/v1/transactions/check-utr?utr=YOUR_UTR_NO
      const res = await axios.get("http://localhost:4001/api/v1/transactions");
      const transactions = res.data.transactions;
      const foundDuplicate = transactions.some(tx => tx.UTRno === utr);

      setIsUtrDuplicate(foundDuplicate);
      if (foundDuplicate) {
        setUtrValidationMessage("This UTR number has already been used.");
      } else {
        setUtrValidationMessage("UTR number is valid.");
      }
    } catch (error) {
      console.error("Error checking UTR duplication:", error);
      setIsUtrDuplicate(false); // Assume not duplicate on error, or handle as needed
      setUtrValidationMessage("Error checking UTR. Please try again.");
    }
  };
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
     if (name === "UTRno") {
      // Clear previous timeout
      if (utrCheckTimeoutRef.current) {
        clearTimeout(utrCheckTimeoutRef.current);
      }
      // Set a new timeout to check UTR after user stops typing
      utrCheckTimeoutRef.current = setTimeout(() => {
        checkUtrDuplication(value);
      }, 500); // 500ms delay
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: "", text: "" }); // Clear previous messages

    // Basic client-side validation for empty fields (though backend also validates)
    const requiredFields = ["name", "email", "Referalcode", "amount", "UTRno"];
    const isFormValid = requiredFields.every(field => formData[field].trim() !== "");
    if (!isFormValid) {
      setFormMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    // Don't submit if UTR is detected as duplicate
    if (isUtrDuplicate) {
      setFormMessage({ type: "error", text: "Cannot submit: UTR number is a duplicate." });
      return;
    }
    try {
      await axios.post("http://localhost:4001/api/v1/transaction", formData);
      alert("Transaction Submitted Successfully");
      setFormData({
        name: "",
        email: "",
        Referalcode: "",
        amount: "",
        UTRno: ""
      });
            setIsUtrDuplicate(false); // Reset duplicate status after successful submission
      setUtrValidationMessage(""); // Clear UTR validation message
    } catch (err) {
       if (err.response && err.response.status === 409) {
        // Backend specifically returned a 409 for duplicate UTR
        setFormMessage({ type: "error", text: err.response.data.message || "A transaction with this UTR number already exists." });
        setIsUtrDuplicate(true); // Ensure button remains disabled
        setUtrValidationMessage(err.response.data.message || "This UTR number is already in use.");
      } else if (err.response && err.response.data && err.response.data.message) {
        setFormMessage({ type: "error", text: err.response.data.message });
      } else {
        setFormMessage({ type: "error", text: "Error submitting transaction. Please try again." });
      }
    }
  };
 // Determine if the submit button should be disabled
  const isSubmitDisabled = !formData.name || !formData.email || !formData.Referalcode || !formData.amount || !formData.UTRno || isUtrDuplicate;

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto bg-white rounded-lg shadow-xl space-y-4 font-inter">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Submit Your Transaction</h2>

      {formMessage.text && (
        <div className={`p-3 rounded-md text-sm ${
          formMessage.type === "success" ? "bg-green-100 text-green-700 border border-green-300" :
          "bg-red-100 text-red-700 border border-red-300"
        }`} role="alert">
          {formMessage.text}
        </div>
      )}

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
        <input
          type="text"
          name="Referalcode"
          placeholder="Referral Code"
          value={formData.Referalcode}
          onChange={handleChange}
          className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
        <input
          type="number" // Changed to number type for amount
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Tailwind to hide spinner
          required
        />
        <div>
          <input
            type="text"
            name="UTRno"
            placeholder="UTR Number"
            value={formData.UTRno}
            onChange={handleChange}
            className="w-full p-3 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
          {utrValidationMessage && (
            <p className={`mt-1 text-sm ${isUtrDuplicate ? "text-red-500" : "text-green-500"}`}>
              {utrValidationMessage}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`w-full p-3 rounded-md text-white font-semibold transition-all duration-300
          ${isSubmitDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"}`}
      >
        Submit Transaction
      </button>
    </form>
  );
};

export default UserTransactionForm;
