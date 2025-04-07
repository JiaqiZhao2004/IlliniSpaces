"use client"; // Enables useState in Next.js

import {useAuth, useUser} from "@clerk/nextjs"; // Correct hook for user info
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./components/Header";
import LoginPage from "./components/LoginPage";

export default function Home() {
  const { isSignedIn, user } = useUser(); // ✅ Corrected hook
  const { getToken } = useAuth();
  const router = useRouter();
  const addUser = async () => {
    const token = await getToken(); // Get Clerk JWT
    const response = await fetch("http://localhost:8080/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        FullName: ""
      })
    });

    const data = await response.json();
    console.log("Added User:", data);
  };

  useEffect(() => {
    if (isSignedIn) {
      addUser().then(() => {
        router.push("/dashboard");
      }); // Redirect to dashboard after login // Redirect logged-in users
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen">
      <Header
        isLoggedIn={isSignedIn || false}
        userEmail={user?.primaryEmailAddress?.emailAddress || ""} // ✅ Extract the actual email string
      />
      <div className="flex h-screen">
        {!isSignedIn && (
          <>
            <div className="w-1/2 bg-[#13294B] text-white flex flex-col justify-center p-12">
              <h1 className="text-4xl font-bold">Welcome to IlliniSpaces</h1>
              <p className="text-lg mt-4">
                Your gateway to the University of Illinois community. Sign in to
                access the available spaces portal.
              </p>
            </div>

            {/* Right Section - Login */}
            <LoginPage />
          </>
        )}
      </div>
    </div>
  );
}
