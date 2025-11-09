import React, { useState } from "react";

const BankProofUpload = ({ userId}) => {
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  // 🧩 Ye function image ko backend pe bhejta hai
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    setUploading(true);

    const res = await fetch("https://ladlilakshmi.onrender.com/api/v1/upload-bank-proof", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (data.success) {
      setProofUrl(data.imageUrl);
    //   onProofUploaded(true); // Parent ko batata hai proof ho gaya
      alert("✅ Bank proof upload successfully!");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="p-4 shadow-md rounded-lg bg-gray-700 text-center mb-4">
      <h2 className="text-lg font-semibold mb-2">Bank Proof Upload</h2>

      {proofUrl ? (
        <div>
          <img src={proofUrl} alt="bank-proof" className="mx-auto w-40 rounded" />
          <p className="text-green-600 mt-2">✔️ Verified</p>
        </div>
      ) : (
        <>
          <input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p>Uploading...</p>}
        </>
      )}
    </div>
  );
};

export default BankProofUpload;
