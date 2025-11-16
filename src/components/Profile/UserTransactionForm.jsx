import React, { useState,useRef } from "react";
import axios from "axios";

const UserTransactionForm = ({user}) => {
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   Referalcode: "",
  //   amount: 0,
  //   UTRno: ""
  // });
  const [UTRno, setUTRno] = useState("");
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
   
      const res = await axios.get(`https://ladlilakshmi.onrender.com/api/v1/transaction/check-utr/${utr}`);
      // res.data ab { exists: true } ya { exists: false } hoga
      const foundDuplicate = res.data.exists;
      console.log("UTR Duplication Check:", res.data);

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
    const { value } = e.target;
    setUTRno(value); // Sirf UTR ko update karein


    // UTR check logic
    if (utrCheckTimeoutRef.current) {
      clearTimeout(utrCheckTimeoutRef.current);
    }
    utrCheckTimeoutRef.current = setTimeout(() => {
      checkUtrDuplication(value);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: "", text: "" });

    // Yeh validation ab 'UTRno' (state se) ko check karega
    if (!UTRno.trim()) { 
      setFormMessage({ type: "error", text: "Please fill in UTR number" });
      return;
    }

    // Don't submit if UTR is detected as duplicate
    if (isUtrDuplicate) {
      setFormMessage({ type: "error", text: "Cannot submit: UTR number is a duplicate." });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFormMessage({ type: "error", text: "Token not found. Please log in again." });
        return;
      }
      // Yeh payload ab 'UTRno' (state se) ko bhejega
      const payload = { UTRno: UTRno };

      const config = {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      };
      await axios.post("https://ladlilakshmi.onrender.com/api/v1/transaction", payload,config);
      alert("Transaction Submitted Successfully");
      setUTRno(""); // Form reset karein
      setIsUtrDuplicate(false);
      setUtrValidationMessage("");
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


  // Yeh ab 'UTRno' (state se) ko check karega
  const isSubmitDisabled = !UTRno || isUtrDuplicate;
 
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
        <div className="bg-gray-100 p-4 rounded-md text-gray-700 space-y-2">
          <p><strong>Name:</strong> {user?.name || 'Loading...'}</p>
          <p><strong>Email:</strong> {user?.email || 'Loading...'}</p>
          <p><strong>User ID:</strong> {user?.referralCode || 'Loading...'}</p>
          <p><strong>Amount:</strong> <span className="font-bold text-green-600">₹400 </span></p>
        </div>
        <div>
          <input
            type="text"
            name="UTRno"
            placeholder="UTR Number"
            value={UTRno}
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
