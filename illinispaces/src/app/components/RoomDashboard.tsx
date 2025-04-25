import React, { useState, useEffect } from "react";
import { RoomCard } from "./RoomCard";
import { SearchIcon, FilterIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const ROOMS_PER_PAGE = 32;

export interface Room {
    BuildingId: string;
    RoomNumber: string;
    Capacity: number;
    Type: string;
}

export function RoomDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteBuildings, setFavoriteBuildings] = useState<Set<string>>(new Set());
  const [rooms, setRooms] = useState<Room[]>([])

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = await getToken();

      try {
        const res = await fetch(`http://localhost:8080/rooms`, {
          headers: {
            method: "GET",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log(data);
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    }

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = await getToken();
      try {
        const res = await fetch("http://localhost:8080/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
  
        const data = await res.json();
        const favoritesSet = new Set<string>(data.favorites);
        setFavoriteBuildings(favoritesSet);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
  
    fetchFavorites();
  }, []);

  const toggleFavorite = async (buildingId: string) => {
    const newSet = new Set(favoriteBuildings);
    const isCurrentlyFavorite = newSet.has(buildingId);
    const token = await getToken();

    try {
      if (isCurrentlyFavorite) {
        const res = await fetch("http://localhost:8080/favorites", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ BuildingId: buildingId }),
        });
        if (!res.ok) throw new Error("Failed to unfavorite");
        newSet.delete(buildingId);
      } else {
        const res = await fetch("http://localhost:8080/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ BuildingId: buildingId }),
        });
        if (!res.ok) throw new Error("Failed to favorite");
        newSet.add(buildingId);
      }

      setFavoriteBuildings(newSet);
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const searchQuery = searchTerm.toLowerCase().replaceAll(' ', '');
    const matchesSearch =
      room.BuildingId.toLowerCase().includes(searchQuery) ||
      room.RoomNumber.toLowerCase().includes(searchQuery) ||
      (room.BuildingId + room.RoomNumber).toLowerCase().includes(searchQuery) ||
      (room.Type && room.Type.toLowerCase().includes(searchQuery));

    const matchesType = filterType ? room.Type === filterType : true;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE);
  const roomTypes = [...new Set(rooms.map((room) => room.Type))];

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
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e74c3c] appearance-none"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
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

      {/* Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {paginatedRooms.length > 0 ? (
          paginatedRooms.map((room, id) => (
            <RoomCard
              room={room}
              key={id}
              isFavorite={favoriteBuildings.has(room.BuildingId)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No rooms match your search criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
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
