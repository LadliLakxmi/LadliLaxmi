import React from "react";
import QRcode from "../../assets/QR_Code.jpg";
import UserTransactionForm from "./UserTransactionForm";

const AddFund = () => {
  return (
    <>
  
    <section className="container mx-auto  mt-10 md:mt-0 p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-100">
        Add Funds to Your Wallet
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-6 bg-gray-800 rounded-lg shadow-xl p-6">
        {/* QR Code Section */}
        <div className="flex flex-col items-center p-4 bg-gray-900 rounded-md shadow-inner flex-shrink-0">
          <p className="text-2xl font-semibold text-amber-400 mb-3">Scan to Pay</p>
          <img
            className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-md border-2 border-gray-700"
            src={QRcode}
            alt="QR Code for Payment"
          />
          <p className="text-4xl mt-4 font-bold text-amber-500">
            ₹400
          </p>
          <p className="text-lg text-gray-400 mt-1">for Level 1 Activation or more as you want</p>
        </div>

    <UserTransactionForm/>
        
      </div>
    </section>
        {/* Instructions Section */}
        <div className="flex flex-col text-lg md:text-xl gap-4 p-4 text-gray-300">
          <h2 className="text-red-400 text-2xl md:text-3xl font-bold mb-2">Instructions:</h2>

          <p className="leading-relaxed">
            After successfully completing your payment, please send a screenshot of the transaction to us on WhatsApp.
          </p>

          <div className="bg-gray-900 p-4 rounded-xl text-center md:text-left">
            <p className="text-xl md:text-2xl font-semibold text-white">
              WhatsApp:{" "}
              <a href="https://wa.me/919627642571" className="text-green-500 hover:underline">
                +91 9627642571
              </a>
              
            </p>
            <p className="text-green-500 hover:underline">
              Call us at: +91 78200 09103
            </p>
              
          </div>

          <p className="text-amber-300 font-medium leading-relaxed">
            Kindly include your: <strong className="text-white">Full Name</strong>, <strong className="text-white">Email ID</strong>, and <strong className="text-white">Referral Code</strong>,and <strong className="text-white">UTR no.</strong> along with the screenshot.
          </p>

          <p className="text-gray-400 leading-relaxed">
            Please note that fund additions typically take <strong className="text-white">up to 24 hours</strong> to reflect in your wallet. We appreciate your patience!
          </p>
        </div>
      </>
  );
};

export default AddFund;
