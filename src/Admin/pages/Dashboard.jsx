import { useEffect, useState } from "react";
import axios from "axios";
import StatsCharts from "../Components/StatsCharts";

// Helper function to format numbers into "Cr" (Crore)
const formatNumberToCr = (num) => {
  if (!num || isNaN(num)) return "0";
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  return num.toLocaleString();
};

// StatCard Component
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300`}
  >
    <h2 className="text-sm font-medium mb-2 opacity-90">{title}</h2>
    <p className="text-4xl font-bold tracking-tight">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [chartType, setChartType] = useState("pie");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://ladlilakshmi.onrender.com/api/v1/admin/getdashboardstats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { totalUsers = 0, totalActiveUsers = 0, totalWithdraw = 0 } =
          res.data || {};

        const data = {
          totalUsers,
          totalActiveUsers,
          totalWithdraws: totalWithdraw,
          actualHelpAmount: totalWithdraw * 0.9,
        };

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statDataArray =
    Object.entries(stats || {}).map(([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      value:
        typeof value === "number" &&
        (key.toLowerCase().includes("withdraw") ||
          key.toLowerCase().includes("help"))
          ? parseFloat((value / 10000000).toFixed(2))
          : value,
    })) || [];

  if (loading) {
    return (
      <div className="text-center text-white text-xl mt-10 animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const colorPalette = [
    "from-indigo-500 to-blue-500",
    "from-emerald-500 to-green-500",
    "from-rose-500 to-pink-500",
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <h1 className="text-4xl text-white font-extrabold mb-10 text-center tracking-wide">
        Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(stats || {}).map(([key, value], index) => (
          <StatCard
            key={key}
            title={key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            value={
              typeof value === "number" &&
              (key.toLowerCase().includes("withdraw") ||
                key.toLowerCase().includes("help"))
                ? `₹${formatNumberToCr(value)}`
                : value?.toLocaleString?.() || "0"
            }
            color={colorPalette[index % colorPalette.length]}
          />
        ))}
      </div>

      {/* Chart Type Dropdown */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-white text-lg font-semibold">Analytics Overview</h2>
        <select
          className="border px-4 py-2 rounded-lg bg-white text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 transition"
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/10">
        <StatsCharts stats={statDataArray} type={chartType} />
      </div>
    </div>
  );
};

export default Dashboard;
