"use client";

import { useUser } from "@clerk/nextjs";
import { Header } from "../../components/Header";
import { SecondaryNavBar } from "../../components/SecondaryNavBar";

export default function RoomStatusPage() {
  const { isSignedIn, user } = useUser();

  const handleClearAll = () => {
    // Reset form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
  };

  return (
    <div className="min-h-screen">
      <Header
        isLoggedIn={isSignedIn || false}
        userEmail={user?.primaryEmailAddress?.emailAddress || ""}
      />
      <SecondaryNavBar selectedId={2} />
      
      <div className="flex justify-center items-center mt-10">
        <div className="bg-white rounded-lg shadow-lg p-8 w-96">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Building
            </h3>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13294B] text-black text-sm"
              placeholder="Search for a building"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Room No.
            </h3>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13294B] text-black text-sm"
              placeholder="ex. 0027"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleClearAll}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
            <button
              className="bg-[#13294B] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#0f1f3d]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Room Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
