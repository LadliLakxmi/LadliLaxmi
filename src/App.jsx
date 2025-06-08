import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useSyncExternalStore } from "react";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode for decoding JWTs (make sure you've installed it)

// Import your custom components and pages
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./Pages/Home";
import Registration from "./Pages/Registration";
import Profile from "./Pages/Profile";
import AdminMain from "./Admin/AdminMain";


// Inline PrivateRoute component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/account" replace />;
};



// --- App Component ---
function App() {
  
  let email = ""; // Variable to hold the decoded email from the token
let role=""
  // useSyncExternalStore is used here to get the 'token' from localStorage,
  // and re-render the component whenever the 'token' in localStorage changes
  // (e.g., from another tab, or from a direct localStorage.setItem call).
  const subscribe = (callback) => {
    window.addEventListener("storage", callback); // Listen for browser storage events
    const intervalId = setInterval(callback, 500); // Also poll every 500ms for robust detection
    return () => {
      clearInterval(intervalId); // Clean up interval
      window.removeEventListener("storage", callback); // Clean up event listener
    };
  };

  const getSnapshot = () => localStorage.getItem("token"); // Function to read the current token from localStorage
  const userToken = useSyncExternalStore(subscribe, getSnapshot, getSnapshot); // Get the current token
 
  // If a user token exists, attempt to decode it to extract the email.
  if (userToken) {
    try {
      const decodedToken = jwtDecode(userToken); // Decode the JWT 
      
      // console.log(decodedToken)
      role=decodedToken.role
      email = decodedToken.email; // Assuming your JWT has an 'email' field
      console.log(role)
    } catch (error) {
      console.error("Invalid token or decoding error:", error);
      // If the token is invalid, it might be corrupted or expired.
      // It's a good practice to remove it from localStorage.
      localStorage.removeItem("token");
    }
  }


  return (
    <Router>
      <Navbar  role={role} />

      <Routes>
        {/* Public Route for Home page */}

        <Route path="/" element={<Home/>} />


        <Route
          path="/account/*"
          element={<Registration />}
        />
        <Route
          path="/userdashboard/*"
          element={
            <PrivateRoute>
              <Profile />
              
            </PrivateRoute>
          }
        />
        <Route
          path="/Admindashboard/*"
          element={
            role==="Admin"&&
              <AdminMain/>
          }
        />

        {/* Fallback Route: For any unmatched paths, redirect to the Home page.
              This uses the 'Navigate' component for declarative redirection. */}
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
