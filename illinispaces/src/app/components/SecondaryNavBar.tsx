import React from "react";

interface SecondaryNavBarProps {
    selectedId: number; // 1, 2, 3  
}

export const SecondaryNavBar: React.FC<SecondaryNavBarProps> = ({ selectedId }) => {
  return (
    <div className="w-full text-white shadow-md">
      <ul className="w-1/3 max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
        <li className={`text-xl font-bold ${selectedId === 1 ? 'border-b-2 border-white' : ''}`}>
          <a href="/pages/find">FIND</a>
        </li>
        <li className={`text-xl font-bold ${selectedId === 2 ? 'border-b-2 border-white' : ''}`}>
          <a href="/pages/room-status">ROOM STATUS</a>
        </li>
        <li className={`text-xl font-bold ${selectedId === 3 ? 'border-b-2 border-white' : ''}`}>
          <a href="/pages/requests">REQUESTS</a>
        </li>
      </ul>
    </div>
  );
};
