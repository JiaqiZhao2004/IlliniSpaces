import React, {useState} from "react";
import { Building2Icon, UsersIcon, LayoutIcon } from "lucide-react";
import {useAuth} from "@clerk/nextjs";

// Define the expected room object structure
export interface Room {
  buildingId: string;
  roomNumber: string;
  capacity: number;
  type: string;
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {

  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservations, setReservations] = useState([]);
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var today_str = yyyy + '-' + mm + '-' + dd;

  // UserReservation ONLY, Hard Reservations is not yet included
  const fetchUserReservations = async (BuildingId, RoomNumber, Date) => {
    const token = await getToken();

    const params = new URLSearchParams({
      BuildingId: BuildingId, // "DKH"
      RoomNumber: RoomNumber,  // "102"
      Date: Date  // "2025-04-21"
    });
    try {
      const response = await fetch(`http://localhost:8080/reservations/search?${params.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || "Failed to fetch reservations");
      }
      console.log(response)
      const data = await response.json();
      setReservations(data.reservations)
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
    {/* Room Card */}
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
        <button
            onClick={() => {
              setIsModalOpen(true);
              fetchUserReservations(room.buildingId, room.roomNumber, today_str);
            }}
            className="w-full py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#d44233] transition-colors duration-300">
          View Status
        </button>
      </div>
    </div>

    {/* Modal (Pop Up Window) */}
    {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div
              className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-2xl relative flex gap-8 h-[80vh] overflow-hidden">

            {/* Left: Room Info (1/3 width) */}
            <div className="w-1/3 space-y-4 text-lg text-gray-700 overflow-y-auto pr-4">
              <h2 className="text-2xl font-bold text-[#152042] mb-4">Room Info</h2>
              <p><strong>Building:</strong> {room.buildingId}</p>
              <p><strong>Room Number:</strong> {room.roomNumber}</p>
              <p><strong>Capacity:</strong> {room.capacity}</p>
              <p><strong>Type:</strong> {room.type}</p>
              <div className="mt-6">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#d44233] transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Right: Scrollable List (2/3 width) */}
            <div className="w-2/3 bg-gray-100 rounded-lg p-4 overflow-y-auto border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Status History</h3>
              <ul className="space-y-2">
                {reservations.map((res, idx) => (
                    <li key={idx} className="bg-white p-3 rounded shadow-sm hover:bg-gray-50 transition">
                      <strong>{res.Email}</strong> reserved this room <strong>{res.StartTime} - {res.EndTime}</strong>
                    </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
    )}
    </>
  );
}
