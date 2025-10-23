import React, { useEffect, useState } from "react";
import axios from "axios";

const DownlineStatus = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User is not authenticated");

        const res = await axios.get(
          "https://ladlilakshmi.onrender.com/api/v1/user/downline-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.downlineStatus || []);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-black text-center">
        Loading downline data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 rounded-xl shadow p-6 text-red-700 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="downline-overview-title"
      className="bg-white rounded-xl shadow p-6 text-black max-w-4xl mx-auto"
    >
      <h2 id="downline-overview-title" className="text-2xl font-semibold mb-6">
        Downline Overview
      </h2>
      {data.length === 0 ? (
        <p className="text-center text-gray-500">No downline data available.</p>
      ) : (
        <table className="w-full border-collapse" role="table">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-3 text-center font-medium">Level</th>
              <th className="border px-4 py-3 text-center font-medium">Members</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ level, actualCount, possibleCount }) => (
              <tr key={level} className="even:bg-gray-50">
                <td className="border px-4 py-2 text-center font-semibold">
                  Level {level}
                </td>
                <td className="border px-4 py-2 text-center">
                  You have {actualCount} out of {possibleCount} members
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default DownlineStatus;
