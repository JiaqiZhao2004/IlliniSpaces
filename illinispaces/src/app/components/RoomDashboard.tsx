import React, { useState } from "react";
import { RoomCard } from "./RoomCard";
import { SearchIcon, FilterIcon } from "lucide-react";
import { sampleRooms, Room } from "./sampleRooms"; // Import full room list

const ROOMS_PER_PAGE = 32; // Number of rooms per page

export function RoomDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Page tracking

  // Filter the full list of rooms
  const filteredRooms = sampleRooms.filter((room) => {
    const searchQuery = searchTerm.toLowerCase();
    const matchesSearch =
      room.buildingId.toLowerCase().includes(searchQuery) ||
      room.roomNumber.toLowerCase().includes(searchQuery) ||
      room.type.toLowerCase().includes(searchQuery); // Added type search

    const matchesType = filterType ? room.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE); // Calculate total pages

  // Paginate results
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE);

  const roomTypes = [...new Set(sampleRooms.map((room) => room.type))];

  return (
    <main className="flex-1 container mx-auto py-8 px-4 w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#152042] mb-6">Available Rooms</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by building, room number, or type"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
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
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {paginatedRooms.length > 0 ? (
          paginatedRooms.map((room, index) => <RoomCard key={index} room={room} />)
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No rooms match your search criteria.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredRooms.length > ROOMS_PER_PAGE && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#e74c3c] text-white"
            }`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Previous
          </button>

          <span className="px-4 py-2 font-bold text-[#152042]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[#e74c3c] text-white"
            }`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
