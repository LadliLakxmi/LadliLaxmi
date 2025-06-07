export default function KYCVerifier({ users, onVerify }) {
  return (
    <div>
      {users.map(user => (
        <div key={user._id} className="bg-[#141628] p-4 rounded shadow mb-2">
          <p><strong>User:</strong> {user.name}</p>
          <p><strong>KYC Status:</strong> {user.kycStatus}</p>
          <button onClick={() => onVerify(user._id)} className="bg-yellow-500 text-white px-4 py-1 rounded">Verify KYC</button>
        </div>
      ))}
    </div>
  );
}