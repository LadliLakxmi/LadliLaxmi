import React from 'react';
import MyTeamTemplate from './MyTeamTemplate';

const MyTeam = ({ team, matrixChildren }) => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="bg-blue-100 flex flex-col sm:flex-row items-center justify-between border-amber-500 border-2 text-black p-4 rounded-md shadow mb-6 text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="font-semibold text-lg">{team.name}</div>
        {/* <div className="text-sm text-gray-600">{team.email}</div> */}
        <div className="text-sm text-gray-600">ID: {team.referralCode}</div>
        <div className="text-sm">Level: {team.currentLevel}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
        {team.matrixChildren?.length > 0 ? (
          team.matrixChildren.map((child, index) => (
            <MyTeamTemplate key={child._id || index} childs={child} />
          ))
        ) : (
          <div className="text-gray-500 text-center col-span-full py-12">
            Loading team data...
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
