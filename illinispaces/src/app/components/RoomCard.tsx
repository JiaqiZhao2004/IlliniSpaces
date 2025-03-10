import React from "react";
import { Building2Icon, UsersIcon, LayoutIcon } from "lucide-react";

// Define the expected room object structure
interface Room {
  buildingId: string;
  roomNumber: string;
  capacity: number;
  type: string;
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="bg-[#152042] text-white p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{room.buildingId}</span>
          <span className="text-xl font-bold">{room.roomNumber}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <Building2Icon className="h-5 w-5 text-[#e74c3c] mr-2" />
          <span className="text-gray-700">Building: {room.buildingId}</span>
        </div>
        <div className="flex items-center mb-3">
          <UsersIcon className="h-5 w-5 text-[#e74c3c] mr-2" />
          <span className="text-gray-700">Capacity: {room.capacity}</span>
        </div>
        <div className="flex items-center">
          <LayoutIcon className="h-5 w-5 text-[#e74c3c] mr-2" />
          <span className="text-gray-700">Type: {room.type}</span>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <button className="w-full py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#d44233] transition-colors duration-300">
          View Status
        </button>
      </div>
    </div>
  );
}
