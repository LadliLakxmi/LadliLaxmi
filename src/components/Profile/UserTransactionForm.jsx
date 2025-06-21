import React, { useState } from "react";
import axios from "axios";

const UserTransactionForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    Referalcode: "",
    amount: "",
    UTRno: ""
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ladlilaxmi.onrender.com/api/v1/transaction", formData);
      alert("Transaction Submitted Successfully");
      setFormData({
        name: "",
        email: "",
        Referalcode: "",
        amount: "",
        UTRno: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error submitting transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto border shadow rounded space-y-3">
      <h2 className="text-xl font-bold">Submit Transaction</h2>
      {["name", "email", "Referalcode", "amount", "UTRno"].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      ))}
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Submit</button>
    </form>
  );
};

export default UserTransactionForm;
