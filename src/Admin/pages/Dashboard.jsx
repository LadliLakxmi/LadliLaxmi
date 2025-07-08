import { useEffect, useState } from "react";
import axios from "axios";
import StatsCharts from "../Components/StatsCharts";

// Helper function to format numbers into "Cr" (Crore)
const formatNumberToCr = (num) => {
  if (num >= 10000000) { // 1 Crore = 10,000,000
    return `${(num / 10000000).toFixed(0)} Cr`;
  }
  return num.toLocaleString(); // For numbers less than a crore, just format normally
};

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
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://ladlilakshmi.onrender.com/api/v1/admin/getallusercount",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { totalUsers } = res.data;

        // Directly assign numbers here. Formatting will be handled in rendering.
        const data = {
          totalUsers,
          totalHelpGiven: 11000000000, // Example: 1100 crore (11,00,00,00,000)
          totalHelpReceived: 920000000, // Example: 92 crore (92,00,00,000)
          totalWithdraws: 480000000, // Example: 48 crore (48,00,00,000)
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
    // Format values for charts if they are numbers and represent monetary values
    value:
      typeof value === "number" &&
      (key.toLowerCase().includes("help") ||
        key.toLowerCase().includes("withdraw"))
        ? parseFloat((value / 10000000).toFixed(2)) // Convert to crore for chart display (e.g., 1100 Cr becomes 1100)
        : value,
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
                ? `₹${formatNumberToCr(value)}` // Use the helper function here
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