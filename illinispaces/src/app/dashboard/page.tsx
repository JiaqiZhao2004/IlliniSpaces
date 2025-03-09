"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "../components/Header";
import { RoomDashboard } from "../components/RoomDashboard";

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Pass props to Header */}
      <Header 
        isLoggedIn={isSignedIn || false} 
        userEmail={user?.primaryEmailAddress?.emailAddress || ""}
      />
      
      <div className="flex flex-col items-center justify-center mt-6">
        <RoomDashboard />
        {/* <SignOutButton /> */}
      </div>
    </div>
  );
}
