import React, { useState, useEffect } from "react";
import Login from "../components/Auth/Login";
import Signup from "../components/Auth/Signup";
import { useLocation, useNavigate } from "react-router-dom";

const Registration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const hasReferral = !!queryParams.get("referralCode");
    setShowLogin(!hasReferral);
    setShowForgotPassword(false);
  }, [location.search]);

  // Redirect to forgot password request page
  const openForgotPassword = () => {
    // Redirect user to a page/form you have for requesting password reset by email
    // If you have a dedicated route, for instance "/forgot-password"
    navigate("/forgot-password");
  };

  return (
    <div>
      <div className="border-gray-300 shadow-2xl p-4">
        <div>
          {showLogin ? (
            <Login
              showForgotPassword={showForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
            />
          ) : (
            <Signup />
          )}
        </div>

        <div className="flex justify-center flex-col items-center">
          <p className="m-auto justify-evenly p-4 w-1/2 md:flex items-center space-x-4">
            {showLogin ? "Don't have an Account?" : "Already have an account?"}
            {showLogin && (
              <button
                className="px-3 py-1 rounded-md bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold hover:from-red-500 hover:to-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                onClick={openForgotPassword}
                type="button"
              >
                Forgot Password
              </button>
            )}
          </p>

          <button
            className="w-md py-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold transition-transform duration-200 hover:scale-95 active:scale-110"
            onClick={() => {
              setShowLogin(!showLogin);
              setShowForgotPassword(false);
            }}
          >
            {showLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
