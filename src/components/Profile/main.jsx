import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import DashboardOverview from "./DashboardOverview";
import axios from "axios";
import TransactionHistory from "./TransactionHistory";
import MyTeam from "./MyTeam";
import Withdraw from "./Withdraw";
import UpgradePage from "./UpgradePage";
import DonateDownline from "./DonateDownline";
import AddFund from "./AddFund";
import UplineBeneficiariesTable from "./UplineBeneficiariesTable";
import DirectTeam from "./DirectTeam";
import MatrixViewer from "./MatrixViewer";
import Id_card from "./Id_card";


const Main = ({ user, setUser }) => {
    const [totalDescendants, setTotalDescendants] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `https://ladlilakshmi.onrender.com/api/v1/profile/get-team/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        setTotalDescendants(data.Team.totalDescendants || 0);
      } catch (err) {
        console.error("Failed to fetch Team data", err);
      }
    };
    if (user._id) fetchData();
  }, [user._id, token]);
  return (
    <div className=" flex  flex-col w-full min-h-screen px-1 md:px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 ">
      <Routes>
        <Route
          path="/"
          element={
            <DashboardOverview
              countchild={totalDescendants}
              user={user}
              setUser={setUser}
              walletTransactions={user.walletTransactions}
            />
          }
        />
        <Route path="/withdraw" element={<Withdraw user={user} />} />
        <Route
          path="/addFund"
          element={<AddFund user={user} matrixChildren={user.matrixChildren} />}
        />
        <Route
          path="/downline"
          element={
            <Dashboard user={user} matrixChildren={user.matrixChildren} />
          }
        />
        <Route
          path="/myteam"
          element={<MyTeam user={user} />}
        />
        <Route path="/directteam" element={<DirectTeam user={user} />} />
        <Route
          path={`/upgrade/${user.currentLevel + 1}`}
          element={
            <UpgradePage
              user={user}
              setUser={setUser}
              matrixChildren={user.matrixChildren}
            />
          }
        />
        <Route
          path={"/upline"}
          element={<UplineBeneficiariesTable currentUser={user} />}
        />
        <Route path="/downline-child-matrix/:id" element={<MatrixViewer />} />
        <Route
          path="/transactions"
          element={
            <TransactionHistory walletTransactions={user.walletTransactions} />
          }
        />
        <Route path="/donate" element={<DonateDownline user={user} />} />
        <Route path="/card" element={<Id_card user={user} />} />
      </Routes>
    </div>
  );
};

export default Main;
