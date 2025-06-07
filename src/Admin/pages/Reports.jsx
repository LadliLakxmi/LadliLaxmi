import { useEffect, useState } from "react";
import axios from "axios";
import StatsCharts from "../Components/StatsCharts";

const Reports = () => {
  const [chartType, setChartType] = useState("pie");
  const [stats, setStats] = useState([
    { label: "Withdrawals", value: 45 },
    { label: "Pending KYC", value: 13 },
    { label: "Completed KYC", value: 90 },
  ]);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://ladlilaxmi.onrender.com/api/v1/admin/getallusercount", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
        const { totalUsers } = res.data;

        // Add total users to the stats list
        setStats((prevStats) => [
          ...prevStats,
          { label: "Total Users", value: totalUsers },
        ]);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }

    fetchUserCount();
  }, []);

  return (
    <div>
      <h2 className="text-xl bg-[#141628] text-white font-bold mb-4 px-4 py-2 rounded">
        Statistics & Reports
      </h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Select Chart Type:</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border p-1 rounded bg-white text-black"
        >
          <option value="pie">Pie Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="radar">Radar Chart</option>
        </select>
      </div>

      <StatsCharts stats={stats} type={chartType} />
    </div>
  );
};

export default Reports;
