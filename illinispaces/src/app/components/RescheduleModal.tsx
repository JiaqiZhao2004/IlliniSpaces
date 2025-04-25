import React, {useEffect, useState} from "react";
import {useAuth} from "@clerk/nextjs";
import "react-datepicker/dist/react-datepicker.css";
import {Alert} from "@/app/components/Alert";


interface RescheduleModalProps {
  ReservationId: string,
  RoomNumber: string,
  BuildingName: string,
  BuildingId: string,
  Date: string,
  StartTime: string,
  OnClose?: () => void
}

export function RescheduleModal({
                                  ReservationId,
                                  RoomNumber,
                                  BuildingName,
                                  BuildingId,
                                  Date,
                                  StartTime,
                                  OnClose
                                }: RescheduleModalProps) {

  const {getToken} = useAuth();
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [reservations, setReservations] = useState([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");

  const updateUserReservations = async (StartTime, EndTime) => {
    if (EndTime <= StartTime) {
      setAlert({message: "End time must be after start time", type: "warning"});
      return
    }
    const token = await getToken();

    try {
      const response = await fetch(`http://localhost:8080/user/reservations`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ReservationId: ReservationId,
          StartTime: StartTime,
          EndTime: EndTime,
          BuildingId: BuildingId, // "DKH"
          RoomNumber: RoomNumber,  // "102"
          Date: Date  //
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setAlert({message: err?.error || "Failed to update", type: "error"});
      } else {
        setAlert({message: "Reservation updated successfully", type: "success"});
        // optionally re-fetch reservations or close modal
      }
    } catch (err) {
      console.error("Update error:", err);
      setAlert({message: "An unexpected error occurred", type: "error"});
    }
  };

  const fetchReservations = async () => {
    const token = await getToken();

    const params = new URLSearchParams({
      BuildingId: BuildingId, // "DKH"
      RoomNumber: RoomNumber,  // "102"
      Date: Date  // "2025-04-21"
    });

    try {
      const response = await fetch(`http://localhost:8080/reservations/search?${params.toString()}`, {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`},
      })
      const data = await response.json();
      setReservations(data.reservations)
    } catch (err) {
      console.error("Error:", err);
    }
  };
  useEffect(() => {
    fetchReservations()
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
        <div
          className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-2xl relative flex gap-8 h-[80vh] overflow-hidden">

          {/* Left: Room Info (1/3 width) */}
          <div className="w-1/3 space-y-4 text-lg text-gray-700 overflow-y-auto pr-4">
            <h2 className="text-2xl font-bold text-[#152042] mb-4">Room Info</h2>
            <p><strong>Building:</strong> {BuildingName}</p>
            <p><strong>Room Number:</strong> {RoomNumber}</p>
            <div className="mt-6">
              <button
                onClick={OnClose}
                className="px-5 py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#d44233] transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>

          {/* Right: Scrollable List (2/3 width) */}
          <div
            className="w-2/3 bg-gray-100 rounded-lg p-4 overflow-y-auto border border-gray-200 flex flex-col">
            <div className="flex-grow overflow-y-auto pr-1">
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">Reservation
                Update</h3>
              <ul className="space-y-2">
                {reservations.map((res, idx) => (
                  <li key={idx}
                      className={`p-3 rounded shadow-sm hover:bg-gray-50 transition 
                      ${res.StartTime == StartTime ? "bg-gray-400" : "bg-white"}`}>
                    <strong>{res.Host}</strong> reserved this
                    room <strong>{res.StartTime} - {res.EndTime}</strong>
                  </li>
                ))}
              </ul>
            </div>
            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}
            <div className="mt-4 pt-4 border-t border-gray-300 flex items-center justify-end gap-4">
              {/* Time inputs */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Start:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />

                <label className="ml-4 text-sm font-medium text-gray-700">End:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>

              {/* Update Button */}
              <button
                onClick={() => {
                  updateUserReservations(
                    startTime,
                    endTime
                  ).then(() => fetchReservations());
                }}
                className="px-5 py-2 bg-[#e74c3c] text-white rounded-md
                             hover:bg-[#d44233] active:bg-[#c7372a]
                             border border-transparent active:border-[#a52a1a]
                             active:ring-2 active:ring-[#a52a1a] active:ring-offset-1
                             transition-all duration-200 ease-in-out">
                Update Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
