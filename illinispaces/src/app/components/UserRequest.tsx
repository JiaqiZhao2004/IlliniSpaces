import {User} from "@clerk/backend";
import {useEffect, useState} from "react";
import {useAuth} from "@clerk/nextjs";
import {RescheduleModal} from "@/app/components/RescheduleModal";

export interface UserRequestProps {
  ReservationId: string;
  RoomNumber: string;
  BuildingName: string;
  BuildingId: string;
  Date: string;
  StartTime: string;
  EndTime: string;
}

export function UserRequest({
  ReservationId,
  RoomNumber,
  BuildingName,
  BuildingId,
  Date,
  StartTime,
  EndTime
}: UserRequestProps) {
  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isActive = (dateStr, startTimeStr) => {
    const now = new globalThis.Date();
    const startDateTime = new globalThis.Date(`${dateStr}T${startTimeStr}`);

    return startDateTime > now;
  };

  const onCancel = async () => {
    const token = await getToken();
    await fetch("/user/reservations", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ReservationId: ReservationId })
    });
  }

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
      {/* Reservation Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          {/* Left: Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700">{BuildingName}</h3>
            <p className="text-gray-600">Room {RoomNumber}</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>Date: {Date}</p>
              <p>From: {StartTime}</p>
              <p>To: {EndTime}</p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          { isActive(Date, StartTime) &&
          <div className="flex gap-2">
            <button
                className="px-4 py-2 bg-[#e74c3c] text-white text-sm rounded-md hover:bg-[#c0392b] shadow transition duration-300"
                onClick={() => setShowConfirm(true)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 border border-[#e74c3c] text-[#e74c3c] text-sm rounded-md hover:bg-[#fbeaea] transition duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              Reschedule
            </button>
          </div> }
        </div>
      </div>

      {/* Confirm Cancel Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Are you sure?</h2>
            <p className="text-sm text-gray-600 mb-6">Do you really want to cancel this reservation?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowConfirm(false)}
              >
                No, go back
              </button>
              <button
                className="px-4 py-2 bg-[#e74c3c] text-white rounded hover:bg-[#c0392b]"
                onClick={() => {
                  setShowConfirm(false);
                  onCancel();  // trigger cancellation logic
                }}
              >
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <RescheduleModal ReservationId={ReservationId} RoomNumber={RoomNumber} BuildingName={BuildingName} BuildingId={BuildingId}
        Date={Date} StartTime={StartTime} OnClose={() => setIsModalOpen(false)}/>}
      </>
  )
}