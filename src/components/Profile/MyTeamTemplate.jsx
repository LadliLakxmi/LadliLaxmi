import React from 'react';

const MyTeamTemplate = ({ childs, isLast = false, parentHasSiblings = false }) => {
    const user = childs;

    return (
        <div className="min-w-full ">
            {/* Node content */}
            <div className="p-3 rounded-lg border-b-1 pt-3 text-center flex items-center justify-evenly  w-full relative z-10 shadow-sm ">
                <div className="font-bold truncate">{user.name}</div>
                <div className="text-xs">ID: {user.referralCode || user._id || "N/A"}</div>
                <div className="text-sm">Level: {user.currentLevel}</div>
            </div>

            {user.matrixChildren?.length > 0 && (
                <div className="flex flex-row flex-wrap justify-center  relative">
                    {user.matrixChildren.map((child, index) => (
                        <React.Fragment  key={child._id || index}>
                            <MyTeamTemplate 
                                childs={child}
                                isLast={index === user.matrixChildren.length - 1}
                                parentHasSiblings={user.matrixChildren.length > 1}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTeamTemplate;
