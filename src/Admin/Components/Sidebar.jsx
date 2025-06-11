import { NavLink } from 'react-router-dom';
import Logout from '../../components/Auth/Logout';

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 transition ${
      isActive ? 'bg-gray-700 font-semibold' : ''
    }`;

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-2">
        <NavLink to="/Admindashboard/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/Admindashboard/users" className={linkClass}>
          Users
        </NavLink>
        <NavLink to="/Admindashboard/payments" className={linkClass}>
          Payments
        </NavLink>
         <NavLink to="/Admindashboard/update" className={linkClass}>
          Update Users
        </NavLink>
        
        <NavLink to="/Admindashboard/reports" className={linkClass}>
          Reports
        </NavLink>
      </nav>
       <div className="mt-6 border-t border-gray-700 pt-4">
          <Logout />
        </div>
    </div>
  );
};

export default Sidebar;
