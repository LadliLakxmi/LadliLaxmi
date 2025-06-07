const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 shadow-lg rounded-lg bg-gray-50 w-96">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input type="text" placeholder="Username" className="w-full p-2 mb-3 border rounded" />
        <input type="password" placeholder="Password" className="w-full p-2 mb-4 border rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </div>
    </div>
  );
};
export default Login;