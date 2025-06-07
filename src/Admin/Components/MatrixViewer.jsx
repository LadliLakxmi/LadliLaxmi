export default function MatrixViewer({ user }) {
  return (
    <div className="p-4 bg-[#141628] rounded">
      <h3 className="text-lg font-bold mb-2">Matrix for {user.name}</h3>
      <pre>{JSON.stringify(user.matrix, null, 2)}</pre>
    </div>
  );
}