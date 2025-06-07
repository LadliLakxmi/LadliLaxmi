import React, { useState, useEffect } from "react";
import Hero from "../sections/Hero";
import Services from "../sections/Services";
import Mission from "../sections/Mission";
import Contact from "../sections/Contact";
import About from "../sections/About";
import FAQ from "../sections/FAQ";
import { jwtDecode } from "jwt-decode";


const Home = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const updateRoleFromToken = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.role) {
            setRole(decoded.role);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Failed to decode token:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };

    updateRoleFromToken();

    // Re-check on token updates
    window.addEventListener("storage", updateRoleFromToken);

    return () => {
      window.removeEventListener("storage", updateRoleFromToken);
    };
  }, []);

  return (
    <div className="m-0">
      {/* ✅ Show Hero if role is not "admin" */}
      {role !== "admin" && <Hero role={role} />}
      
      <About />
      <Mission />
      <Services />
      <Contact />
      <FAQ />
    </div>
  );
};

export default Home;
