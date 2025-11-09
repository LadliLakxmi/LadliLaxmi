import React, { useState } from "react";

const BankProofUpload = ({ userId }) => {
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    setUploading(true);

    try {
      const res = await fetch(
        "https://ladlilakshmi.onrender.com/api/v1/upload-bank-proof",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      setUploading(false);

      if (data.success) {
        setProofUrl(data.imageUrl);
        alert("✅ Bank proof uploaded successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      setUploading(false);
      alert("❌ Something went wrong while uploading.");
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-center">
      <h2 className="text-xl font-bold text-white mb-4">Upload Bank Proof</h2>

      {proofUrl ? (
        <div>
          <img
            src={proofUrl}
            alt="bank-proof"
            className="mx-auto w-48 h-48 object-cover rounded-lg border-2 border-green-500 shadow-lg"
          />
          <p className="text-green-400 font-semibold mt-3">✅ Uploaded Successfully</p>
        </div>
      ) : (
        <label
          htmlFor="bankProofUpload"
          className={`flex flex-col justify-center items-center w-full p-6 cursor-pointer border-2 border-dashed rounded-lg text-gray-300 transition-all
            ${uploading ? "border-gray-500 bg-gray-700" : "border-blue-500 hover:bg-blue-500/10"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 010 10H7z"
            />
          </svg>

          <span className="font-medium">
            {uploading ? "Uploading..." : "Click to select or drop bank proof here"}
          </span>

          <input
            id="bankProofUpload"
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default BankProofUpload;
