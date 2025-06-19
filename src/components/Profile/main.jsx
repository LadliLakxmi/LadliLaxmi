import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import DashboardOverview from "./DashboardOverview";
import DonatePage from "./Activation";
import TransactionHistory from "./TransactionHistory";
import MyTeam from "./MyTeam";
import Withdraw from "./Withdraw";
import UpgradePage from "./UpgradePage";
import DonateDownline from "./DonateDownline"
import AddFund from "./AddFund";
import TransferSponsorToMain from "./TransferSponsorToMain";
import UplineBeneficiariesTable from "./UplineBeneficiariesTable";

const Main = ({ user,setUser }) => {
  return (
    <div className=" flex  flex-col w-full min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 ">
      <Routes>
        {/* <Route
          path="/"
          element={
            <div className="flex flex-col items-center justify-center text-center text-white px-4 py-10 sm:py-16">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                Hii, Welcome Back
              </h1>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-amber-400 font-bold mt-2">
                {user.name}
              </h2>
              <p className="text-xl sm:text-2xl mt-6">
                Check Out your Dashboard
              </p>
              <h3 className="text-4xl sm:text-5xl mt-4">👈</h3>
            </div>
          }
        /> */}
        <Route path="/" element={<DashboardOverview user={user} setUser={setUser} walletTransactions={user.walletTransactions}/>} />
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
          element={<MyTeam team={user} matrixChildren={user.matrixChildren} />}
        />
{/*         {user.currentLevel === 0 ? (
          <Route
            path="/donatePage"
            element={<DonatePage user={user} matrixChildren={user.matrixChildren} />}
          />
        ) : (
          <Route
            path={`/upgrade/${user.currentLevel + 1}`}
            element={<UpgradePage user={user} matrixChildren={user.matrixChildren} />}
          />
        )} */}
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
