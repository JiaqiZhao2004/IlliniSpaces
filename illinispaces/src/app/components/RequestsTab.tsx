// RequestsTab.js
"use client";

import { UserRequest } from "../components/UserRequest";

export function RequestsTab() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col mt-10">
      <h1 className="text-3xl font-bold mb-8 text-left">Active Requests</h1>
      <div className="w-full max-w-4xl space-y-4">
        <UserRequest RoomNumber="0027" BuildingName="Noyes Laboratory" Date="2025-03-10" StartTime="10:00 AM" EndTime="11:00 AM" />
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-left mt-10">Past Requests</h1>
      <div className="w-full max-w-4xl space-y-4">
        <UserRequest RoomNumber="0029" BuildingName="Noyes Laboratory" Date="2025-03-05" StartTime="10:00 AM" EndTime="11:00 AM" />
      </div>
    </div>
  );
}
