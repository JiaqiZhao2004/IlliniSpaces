"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserRequest } from "../components/UserRequest";

type Reservation = {
  RoomNumber: string;
  BuildingName: string;
  Date: string;
  StartTime: string;
  EndTime: string;
};

export function RequestsTab() {
  const { getToken } = useAuth();
  const [activeRequests, setActiveRequests] = useState<Reservation[]>([]);
  const [pastRequests, setPastRequests] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8080/user/reservations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch reservations");

        const data = await res.json();
        setActiveRequests(data.active);
        setPastRequests(data.past);
      } catch (err) {
        console.error("Error loading reservations:", err);
      }
    };

    fetchReservations();
  }, [getToken]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col mt-10">
      <h1 className="text-3xl font-bold mb-8 text-left">Active Requests</h1>
      <div className="w-full max-w-4xl space-y-4">
        {activeRequests && activeRequests.length > 0 ? (
          activeRequests.map((req, i) => (
            <UserRequest key={i} {...req} />
          ))
        ) : (
          <p className="text-gray-500">No active requests.</p>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-8 text-left mt-10">Past Requests</h1>
      <div className="w-full max-w-4xl space-y-4">
        {pastRequests && pastRequests.length > 0 ? (
          pastRequests.map((req, i) => (
            <UserRequest key={i} {...req} />
          ))
        ) : (
          <p className="text-gray-500">No past requests.</p>
        )}
      </div>
    </div>
  );
}
