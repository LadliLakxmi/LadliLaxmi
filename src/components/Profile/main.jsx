import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import DashboardOverview from "./DashboardOverview";
import DonatePage from "./Activation";
import axios from 'axios'; 
import TransactionHistory from "./TransactionHistory";
import MyTeam from "./MyTeam";
import Withdraw from "./Withdraw";
import UpgradePage from "./UpgradePage";
import DonateDownline from "./DonateDownline"
import AddFund from "./AddFund";
import TransferSponsorToMain from "./TransferSponsorToMain";
import UplineBeneficiariesTable from "./UplineBeneficiariesTable";
import DirectTeam from "./DirectTeam";

const countAllDescendantsBFS = (team) => {
  if (!team || !team.matrixChildren || team.matrixChildren.length === 0) {
    return 0;
  }

  let count = 0;
  const queue = [...team.matrixChildren]; // Start with direct children

  while (queue.length > 0) {
    const current = queue.shift(); // Get the first node from the queue
    count++; // Count this descendant

    // Add its direct children to the end of the queue
    if (current.matrixChildren && current.matrixChildren.length > 0) {
      for (const child of current.matrixChildren) {
        queue.push(child);
      }
    }
  }
  return count;
};

const Main = ({ user,setUser }) => {

  const [team, setTeam] = useState(null);
    const token = localStorage.getItem("token");
      useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await axios.get(
            // Using localhost for development, ensure it's correct for your setup
  
            `https://ladlilaxmi.onrender.com/api/v1/profile/get-team/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setTeam(data.data.Team);
          console.log("Team data: ",data.data.Team);
        } catch (err) {
          console.error("Failed to fetch Team", err);
          // Optionally, set an error state here to display a message to the user
        }
      };
      if (user._id) fetchData();
    }, [user._id,token]); // Added token to dependency array for completeness
     
    const totalChildCount = countAllDescendantsBFS(team); // 🧮 Total child count
    
  


  return (
    <div className=" flex  flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 ">
      <Routes>
        
  
          
        <Route path="/" element={<DashboardOverview countchild={totalChildCount} user={user} setUser={setUser} walletTransactions={user.walletTransactions}/>} />
        <Route path="/withdraw" element={<Withdraw user={user} />} />
        <Route
          path="/moneyTransfer"
          element={ <TransferSponsorToMain user={user} />} />
        <Route
          path="/addFund"
          element={<AddFund user={user} matrixChildren={user.matrixChildren} />}
        />
        <Route
          path="/downline"
          element={<Dashboard user={user} matrixChildren={user.matrixChildren} />}
        />
        <Route
          path="/myteam"
          element={<MyTeam team={team} matrixChildren={user.matrixChildren} />}
        />
        <Route
          path="/directteam"
          element={<DirectTeam team={team} />}
        />
        <Route
            path={`/upgrade/${user.currentLevel + 1}`}
            element={<UpgradePage user={user} setUser={setUser} matrixChildren={user.matrixChildren} />}
          />
          <Route
            path={"/upline"}
            element={<UplineBeneficiariesTable currentUser = {user}/>}
          />
        <Route
          path="/transactions"
          element={<TransactionHistory walletTransactions={user.walletTransactions} />}
        />
        <Route
          path="/donate"
          element={<DonateDownline user={user} />} 
                  />
      </Routes>
    </div>
  );
};

export default Main;
