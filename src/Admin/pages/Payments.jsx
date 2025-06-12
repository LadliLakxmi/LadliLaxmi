import { useState } from "react";
import AdminWithdrawPanel from "../Components/AdminWithdrawPanel";

const Payments = () => {
  return (
    <div>
      <h2 className="text-xl bg-[#141628] font-bold mb-4">Pending Withdraw Approvals</h2>
      <AdminWithdrawPanel />
      
    </div>
  );
};

export default Payments;
