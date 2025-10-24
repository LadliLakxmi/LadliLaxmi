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
        const res = await axios.get(
          "https://ladlilakshmi.onrender.com/api/v1/user/downline-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.downlineStatus || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-600 p-6">Data is Loading...  Please wait.... </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 p-6">{error}</div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-black w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
        Downline Status Summary
      </h2>

      <table className="w-full text-center text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-3 px-2 border">Level</th>
            <th className="py-3 px-2 border">Active</th>
            <th className="py-3 px-2 border">Inactive</th>
            <th className="py-3 px-2 border">Possible</th>
            <th className="py-3 px-2 border">Progress</th>
          </tr>
        </thead>

        <tbody>
          {data.map(({ level, actualCount, inactiveCount, possibleCount }) => {
            const progress = Math.round(
              (actualCount / possibleCount) * 100
            );
            return (
              <tr key={level} className="even:bg-gray-50">
                <td className="py-2 border font-semibold text-indigo-600">
                  {level}
                </td>
                <td className="py-2 border font-semibold">
                  {actualCount}
                </td>
                <td
                  className={`py-2 border font-semibold ${
                    inactiveCount > 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {inactiveCount}
                </td>
                <td className="py-2 border">{possibleCount}</td>

                {/* Progress Bar */}
                <td className="py-2 border">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{progress}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DownlineStatus;
