"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs"; // Import Clerk hook

interface HeaderProps {
  isLoggedIn: boolean;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, userEmail }) => {
  const { signOut } = useClerk(); // Clerk's signOut function
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();             // Sign the user out using Clerk
    router.push("/dashboard");   // Redirect to dashboard after sign out
  };

  return (
    <header className="w-full bg-[#13294B] text-white border-b border-[#E84A27] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
        <a href="/dashboard" className="text-2xl font-bold hover:text-[#E84A27] transition-colors">
          IlliniSpaces
        </a>

        {isLoggedIn && (
          <div className="flex items-center gap-4 text-sm">
            <span>
              Signed in as <span className="text-[#E84A27]">{userEmail}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="bg-[#E84A27] text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
