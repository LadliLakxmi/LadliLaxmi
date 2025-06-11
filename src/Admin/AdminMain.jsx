// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Sidebar from './Components/Sidebar';
import UpdateUser from './pages/UpdateUser'


function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 min-h-screen">{children}</div>
    </div>
  );
}

const AdminMain = () =>  {
  const isAdmin = true; // Replace with real auth logic

  return (
    
      <Routes>

        {/* <Route path="/" element={<AdminLayout />} /> */}
        {/* <Route path="/admin/login" element={<Login />} /> */}

        {isAdmin ? (
          <>
            <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/users" element={<AdminLayout><Users /></AdminLayout>} />
            <Route path="/payments" element={<AdminLayout><Payments /></AdminLayout>} />
                      <Route path="/update" element={<AdminLayout><UpdateUser /></AdminLayout>} />
        
            <Route path="/reports" element={<AdminLayout><Reports /></AdminLayout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    
  );
}

export default AdminMain
