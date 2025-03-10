"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/Header"; // ✅ Restored Header
import { RoomDashboard } from "../components/RoomDashboard"; // ✅ Room Filtering List
import { SecondaryNavBar } from "../components/SecondaryNavBar";

const DynamicCampusMap = dynamic(() => import("../components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // ✅ State to track the active tab

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isLoggedIn={isSignedIn || false} 
        userEmail={user?.primaryEmailAddress?.emailAddress || ""}
      />
      <div className="flex flex-col items-center justify-center">

        {/* ✅ Tabs Section */}
        <div className="w-full">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-center ${activeTab === 0 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(0)}
            >
              Room Filtering
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 1 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(1)}
            >
              Campus Map
            </button>
          </div>

          {/* ✅ Tab Content */}
          <div className="p-4">
            {activeTab === 0 ? (
              <RoomDashboard /> // ✅ Shows the Room Filtering List
            ) : (
              <DynamicCampusMap /> // ✅ Shows the Campus Map
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
