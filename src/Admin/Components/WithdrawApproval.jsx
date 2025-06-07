export default function WithdrawApproval({ requests, onApprove }) {
  if (!requests || requests.length === 0) {
    return <p className="text-center text-gray-500">No withdraw requests found.</p>;
  }

  return (
    <div>
      {requests.map((req) => (
        <div key={req._id} className="bg-[#141628] p-4 rounded shadow mb-4 border border-gray-200">
          <p><strong>User:</strong> {req.user}</p>
          <p><strong>Amount:</strong> ₹{req.amount}</p>
          <p><strong>Bank Name:</strong> {req.bankName}</p>
          <p><strong>Account Number:</strong> {req.accountNumber}</p>
          <p><strong>IFSC Code:</strong> {req.ifsc}</p>
          <p>
            <strong>Status:</strong> <span>{req.status}</span>
          </p>
          {req.status === "Pending" && (
            <button
              onClick={() => onApprove(req._id)}
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mt-2"
            >
              Approve
            </button>
          )}
          {req.status !== "Pending" && (
            <p className="mt-2 text-gray-500">No actions available</p>
          )}
        </div>
      ))}
    </div>
  );
}
