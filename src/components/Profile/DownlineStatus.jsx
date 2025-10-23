import React, { useEffect, useState } from "react";
import axios from "axios";

const DownlineStatus = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://ladlilakshmi.onrender.com/api/v1/user/downline-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.downlineStatus);
    };
    fetchStatus();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6 text-black">
      <h2 className="text-xl font-bold mb-4">Downline Overview</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-center">Level</th>
            <th className="border px-3 py-2 text-center">Members</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.level}>
              <td className="border px-3 py-2 text-center">Level {row.level}</td>
              <td className="border px-3 py-2 text-center">
                You have {row.actualCount} out of {row.possibleCount} members
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DownlineStatus;
