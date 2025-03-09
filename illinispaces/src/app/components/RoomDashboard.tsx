import React, { useState } from "react";
import { RoomCard } from "./RoomCard";
import { SearchIcon, FilterIcon } from "lucide-react";
import { sampleRooms, Room } from "./sampleRooms"; // ✅ Import sampleRooms

export function RoomDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredRooms = sampleRooms.filter((room) => {
    const matchesSearch =
      room.buildingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? room.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const roomTypes = [...new Set(sampleRooms.map((room) => room.type))];

  return (
    <main className="flex-1 container mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#152042] mb-6">Available Rooms</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by building or room number"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e74c3c] appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Cards Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => <RoomCard key={index} room={room} />)
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No rooms match your search criteria.
          </div>
        )}
      </div>
    </main>
  );
}
