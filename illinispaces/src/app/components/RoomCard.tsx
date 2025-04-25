import React, {useEffect, useState} from "react";
import {useAuth} from "@clerk/nextjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {Building2Icon, UsersIcon, LayoutIcon, Star} from "lucide-react";
import {Alert} from "@/app/components/Alert";
import {Room} from "@/app/components/RoomDashboard";

interface RoomCardProps {
    room: Room,
    isFavorite: boolean,
    onToggleFavorite: (buildingId: string) => void,
    key?: number
}

export function RoomCard({room, isFavorite, onToggleFavorite}: RoomCardProps) {

    const {getToken} = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
    const [reservations, setReservations] = useState([]);
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("00:00");
    const [date, setDate] = useState(new Date());
    const dd = (date) => String(date.getDate()).padStart(2, '0');
    const mm = (date) => String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = (date) => date.getFullYear();
    const date_to_str = (date) => yyyy(date) + '-' + mm(date) + '-' + dd(date);

    // UserReservation ONLY, Hard Reservations is not yet included
    const addUserReservations = async (BuildingId, RoomNumber, Date, StartTime, EndTime) => {
        if (EndTime <= StartTime) {
            setAlert({message: "End time must be after start time", type: "warning"});
            return
        }
        const token = await getToken();

        try {
            const response = await fetch(`http://localhost:8080/user/reservations`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    BuildingId: BuildingId,
                    RoomNumber: RoomNumber,
                    Date: Date,
                    StartTime: StartTime,
                    EndTime: EndTime
                })
            })
            const msg = await response.json()
            if (response.ok) {
                setAlert({message: "Reservation successful!", type: "success"});
            } else if (response.status == 400 || response.status == 409) {
                setAlert({message: msg["error"], type: "error"});
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

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
                headers: {Authorization: `Bearer ${token}`},
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

    // Close modal with ESC key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener("keydown", handleEsc);
        }

        // Cleanup listener when modal closes
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isModalOpen]);
    return (
        <>
            {/* Room Card */}
            <div
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="bg-[#152042] text-white p-4">
                    <div className="flex justify-between items-center">
                        {/* Left: Building ID + Room Number */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{room.BuildingId}</span>
                            <span className="text-xl font-bold">{room.RoomNumber}</span>
                        </div>

                        {/* Right: Status Dot */}
                        <div className="relative group">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    room.Available ? "bg-green-400" : "bg-red-400"
                                }`}
                            />
                            {/* Tooltip */}
                            <div
                                className="absolute -top-1.5 right-5 bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                                {room.Available ? "Available Now" : "Occupied Now"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <Building2Icon className="h-5 w-5 text-[#e74c3c] mr-2"/>
                            <span className="text-gray-700">Building: {room.BuildingName}</span>
                        </div>
                        <button
                            onClick={() => onToggleFavorite(room.BuildingId)}
                            className="text-yellow-400 hover:scale-110 transition-transform"
                            aria-label="Toggle Favorite"
                        >
                            <Star
                                className={`h-5 w-5 ${isFavorite ? "fill-yellow-400" : "stroke-yellow-400"}`}
                                fill={isFavorite ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <div className="flex items-center mb-3">
                        <UsersIcon className="h-5 w-5 text-[#e74c3c] mr-2"/>
                        <span className="text-gray-700">Capacity: {room.Capacity}</span>
                    </div>
                    <div className="flex items-center">
                        <LayoutIcon className="h-5 w-5 text-[#e74c3c] mr-2"/>
                        <span className="text-gray-700">Type: {room.Type}</span>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            fetchUserReservations(room.BuildingId, room.RoomNumber, date_to_str(date));
                        }}
                        className="w-full py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#d44233] transition-colors duration-300">
                        View Status
                    </button>
                </div>
            </div>

            {/* Modal (Pop Up Window) */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-2xl relative flex gap-8 h-[80vh] overflow-hidden">

                        {/* Left: Room Info (1/3 width) */}
                        <div className="w-1/3 space-y-4 text-lg text-gray-700 overflow-y-auto pr-4">
                            <h2 className="text-2xl font-bold text-[#152042] mb-4">Room Info</h2>
                            <p><strong>Building:</strong> {room.BuildingId}</p>
                            <p><strong>Room Number:</strong> {room.RoomNumber}</p>
                            <p><strong>Capacity:</strong> {room.Capacity}</p>
                            <p><strong>Type:</strong> {room.Type}</p>
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
                        <div
                            className="w-2/3 bg-gray-100 rounded-lg p-4 overflow-y-auto border border-gray-200 flex flex-col">
                            <div className="flex-grow overflow-y-auto pr-1">
                                <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                                    <span>Room Status for:</span>
                                    <div className="relative">
                                        <DatePicker
                                            selected={date}
                                            onChange={
                                                (date) => {
                                                    setDate(date);
                                                    fetchUserReservations(room.BuildingId, room.RoomNumber, date_to_str(date))
                                                }
                                            }
                                            className="border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                                            calendarClassName="z-51" // keeps the calendar above modal
                                        />
                                    </div>
                                </h3>
                                {reservations.length == 0 ?
                                    <h4 className="text-center fullwidth">No reservations on this day</h4> :
                                    <ul className="space-y-2">
                                        {reservations.map((res, idx) => (
                                            <li key={idx}
                                                className="bg-white p-3 rounded shadow-sm hover:bg-gray-50 transition">
                                                <strong>{res.Host}</strong> reserved this
                                                room <strong>{res.StartTime} - {res.EndTime}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                }
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

                                {/* Reserve Button */}
                                <button
                                    onClick={() => {
                                        addUserReservations(
                                            room.BuildingId,
                                            room.RoomNumber,
                                            date_to_str(date),
                                            startTime,
                                            endTime
                                        ).then(() => fetchUserReservations(room.BuildingId, room.RoomNumber, date_to_str(date)));
                                    }}
                                    className="px-5 py-2 bg-[#e74c3c] text-white rounded-md
                               hover:bg-[#d44233] active:bg-[#c7372a]
                               border border-transparent active:border-[#a52a1a]
                               active:ring-2 active:ring-[#a52a1a] active:ring-offset-1
                               transition-all duration-200 ease-in-out"
                                >
                                    Reserve for {date_to_str(date)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
