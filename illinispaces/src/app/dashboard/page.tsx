// Dashboard.js
"use client";

import { useUser, useAuth, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/Header";
import { RoomDashboard } from "../components/RoomDashboard";
import { SecondaryNavBar } from "../components/SecondaryNavBar";
import { RequestsTab } from "../components/RequestsTab";
import { Favorites } from "../components/Favorites";

const DynamicCampusMap = dynamic(() => import("../components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  
  // Example frontend call to backend with Clerk JWT
  const { getToken } = useAuth();

  // const fetchUserData = async () => {
  //   const token = await getToken(); // Get Clerk JWT
  //   const response = await fetch("http://localhost:5000/protected", {
  //     method: "GET",
  //     headers: { Authorization: `Bearer ${token}` },
  //   });

  //   const data = await response.json();
  //   console.log("User Data:", data);
  // };

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
        <div className="w-full">
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-center ${activeTab === 0 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(0)}
            >
              Find Room
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 1 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(1)}
            >
              Campus Map
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 2 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(2)}
            >
              Requests
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 3 ? "border-b-2 border-red-500 font-bold" : "text-gray-500"}`}
              onClick={() => setActiveTab(3)}
            >
              Favorites
            </button>
          </div>

          <div className="p-4">
            {activeTab === 0 ? (
              <RoomDashboard />
            ) : activeTab === 1 ? (
              <DynamicCampusMap />
            ) : activeTab === 2 ?(
              <RequestsTab />
            ) : (
              <Favorites />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
