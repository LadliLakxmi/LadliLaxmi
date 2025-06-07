import { useEffect, useState } from "react";
import axios from "axios";
import StatsCharts from "../Components/StatsCharts";

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <h2 className="text-black text-sm">{title}</h2>
    <p className="text-2xl text-black font-semibold">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chartType, setChartType] = useState("pie");

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token"); // ✅ define token here
        const res = await axios.get(
          "http://localhost:4001/api/v1/admin/getallusercount",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { totalUsers } = res.data;

        const data = {
          totalUsers,
          totalHelpGiven: 85,
          totalHelpReceived: 92,
          totalWithdraws: 48,
        };

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    fetchStats();
  }, []);

  const statDataArray = Object.entries(stats).map(([key, value]) => ({
    label: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase()),
    value: value,
  }));

  return (
    <div>
      <h1 className="text-2xl text-white font-bold mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <StatCard
            key={key}
            title={key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            value={
              typeof value === "number" &&
              (key.toLowerCase().includes("help") ||
                key.toLowerCase().includes("withdraw"))
                ? `₹${value.toLocaleString()}`
                : value
            }
          />
        ))}
      </div>

      {/* Chart Type Dropdown */}
      <div className="mb-4">
        <label className="font-medium mr-2">Chart Type:</label>
        <select
          className="border px-3 py-2 rounded bg-white text-black"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="pie">Pie Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="radar">Radar Chart</option>
        </select>
      </div>

      {/* Stats Chart */}
      <StatsCharts stats={statDataArray} type={chartType} />
    </div>
  );
};

export default Dashboard;
