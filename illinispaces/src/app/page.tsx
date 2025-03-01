"use client"; // Enables useState in Next.js

import { useState } from "react";
import {Header} from "./components/Header";
import LoginPage from "./components/LoginPage";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  return (
    <div className="min-h-screen">
      {/* Pass props to Header */}
      <Header isLoggedIn={isLoggedIn} userEmail={userEmail || ""} />

      <div className="flex h-screen">
        {/* Left Section */}
        {!isLoggedIn && (
          <>
            <div className="w-1/2 bg-[#13294B] text-white flex flex-col justify-center p-12">
              <h1 className="text-4xl font-bold">Welcome to IlliniSpaces</h1>
              <p className="text-lg mt-4">
                Your gateway to the University of Illinois community. Sign in to
                access exclusive resources and connect with fellow Illini.
              </p>
            </div>

            {/* Right Section - Login */}
            <LoginPage onLogin={handleLogin} />
          </>
        )}

        {/* Logged-in View */}
        {isLoggedIn && (
          <div className="w-full flex justify-center items-center">
            <div className="max-w-lg bg-white rounded-lg shadow-sm border p-8 text-center">
              <h2 className="text-2xl font-semibold text-[#13294B] mb-4">
                Welcome, {userEmail}!
              </h2>
              <p className="text-gray-600">
                You have successfully logged in to your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
