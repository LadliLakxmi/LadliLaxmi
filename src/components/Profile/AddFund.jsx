import React from "react";
import QRcode from "../../assets/QR_Code.jpg";
import UserTransactionForm from "./UserTransactionForm";

const AddFund = () => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const bankDetails = [
    { label: "Account Number", value: "2502416277758053" },
    { label: "IFSC", value: "AUBL0004162" },
    { label: "Swift Code", value: "AUBLINBBXXX" },
    { label: "Bank Name", value: "AU Small Finance Bank" },
    { label: "Branch", value: "NOIDA & GAUTAM BUDDHA NAGAR" },
  ];

  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-100">
        Add Funds to Your Wallet
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Side - QR & Form */}
        <div className="bg-gray-300 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Scan & Pay
          </h2>
          <div className="flex flex-col items-center">
            <img
              className="w-64 h-64 md:w-72 md:h-72 object-contain rounded-lg border border-gray-300"
              src={QRcode}
              alt="QR Code for Payment"
            />
            <p className="text-4xl mt-4 font-bold text-green-600">₹400</p>
            <p className="text-sm text-gray-500">
              for Level 1 Activation or more as you wish
            </p>
          </div>
          <div className="mt-6">
            <UserTransactionForm />
          </div>
        </div>

        {/* Right Side - Bank & Instructions */}
        <div className="space-y-6">
          {/* Bank Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              LADLI LAXMI JAN HIT TRUST
            </h2>
            <div className="grid grid-cols-3 gap-y-3 text-gray-700 text-lg">
              {bankDetails.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="font-semibold col-span-1">{item.label}:</span>
                  <span className="col-span-2 flex items-center justify-between text-gray-900">
                    {item.value}
                    {idx < 3 && (
                      <button
                        onClick={() => copyToClipboard(item.value)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Copy
                      </button>
                    )}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-gray-300">
            <h2 className="text-red-400 text-xl font-bold mb-3">Instructions:</h2>
            <p className="mb-3">
              After completing your payment, please send a screenshot of the
              transaction to our WhatsApp.
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-lg font-semibold text-white flex items-center justify-between">
                WhatsApp:{" "}
                <span>
                  <a
                    href="https://wa.me/919627642571"
                    className="text-green-500 hover:underline"
                  >
                    +91 96276 42571
                  </a>
                  <button
                    onClick={() => copyToClipboard("+919627642571")}
                    className="ml-3 text-blue-400 hover:underline text-sm"
                  >
                    Copy
                  </button>
                </span>
              </p>
              <p className="text-green-500 hover:underline">
                Call us: +91 78200 09103
              </p>
            </div>
            <p className="text-amber-300 font-medium mb-3">
              Please include:{" "}
              <strong className="text-white">Full Name</strong>,{" "}
              <strong className="text-white">Email ID</strong>,{" "}
              <strong className="text-white">Referral Code</strong>, and{" "}
              <strong className="text-white">UTR No.</strong> in your message.
            </p>
            <p className="text-gray-400 text-sm">
              Fund additions can take{" "}
              <strong className="text-white">up to 24 hours</strong> to reflect
              in your wallet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddFund;
