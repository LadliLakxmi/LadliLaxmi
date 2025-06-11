import React from 'react'
import Login from '../components/Auth/Login'
import Signup from '../components/Auth/Signup'
import { useState } from 'react'

const Registration = () => {
  
    const [showLogin, setShowLogin] = useState(false); // Correct usage of useState
  return (
    <div>
        <div className="border-gray-300 shadow-2xl p-4  ">
        <div>
          {showLogin ? <Login /> : <Signup />} {/* Use showLogin directly */}
        </div>
        <div className="flex justify-center flex-col items-center">
          <p className="m-auto">
            {showLogin ? "Don't have an Account?" : "Already have an account?"}{" "}
            {/* Conditional text */}
          </p>
          <button
            className=" w-md py-2 rounded-md bg-gradient-to-r from-amber-400 to-amber-600
             text-white font-semibold transition-transform duration-200 hover:scale-95 
             active:scale-110"
             // Toggle showLogin state
             onClick={() => setShowLogin(!showLogin)} >
            {showLogin ? "Register" : "Login"}{" "}
            {/* Conditional button text */}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Registration
