import { useState } from "react";
import AdminWithdrawPanel from "../Components/AdminWithdrawPanel";

const Payments = () => {
  
  // const [payments, setPayments] = useState([
  //   {
  //     _id: "p1",
  //     user: "Mukesh Kumar",
  //     amount: 2500,
  //     bankName: "State Bank of India",
  //     accountNumber: "1234567890",
  //     ifsc: "SBIN0001234",
  //     status: "Pending",
  //   },
  //   {
  //     _id: "p2",
  //     user: "Anita Sharma",
  //     amount: 1500,
  //     bankName: "HDFC Bank",
  //     accountNumber: "9876543210",
  //     ifsc: "HDFC0005678",
  //     status: "Pending",
  //   },
  //   {
  //     _id: "p3",
  //     user: "Raj Patel",
  //     amount: 4000,
  //     bankName: "ICICI Bank",
  //     accountNumber: "1122334455",
  //     ifsc: "ICIC0009988",
  //     status: "Pending",
  //   },
  // ]);

  const handleApprove = (id) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment._id === id ? { ...payment, status: "Approved" } : payment
      )
    );
  };

  const handleReject = (id) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment._id === id ? { ...payment, status: "Rejected" } : payment
      )
    );
  };

  return (
    <div>
      <h2 className="text-xl bg-[#141628] font-bold mb-4">Pending Withdraw Approvals</h2>
      <AdminWithdrawPanel />
      {/* <PaymentApproval
        payments={payments}
        onApprove={handleApprove}
        onReject={handleReject}
      /> */}
    </div>
  );
};

export default Payments;
