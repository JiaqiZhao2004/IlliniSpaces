"use client"; // Ensures Clerk runs on client-side

import { SignIn } from "@clerk/nextjs"; // Clerk's built-in SignIn component
import { useAuth } from "@clerk/nextjs"; // To check authentication state
import { useRouter } from "next/navigation"; // For navigation after login
import { useEffect } from "react";

const LoginPage = () => {
  const { isSignedIn} = useAuth();
  const router = useRouter();
  const addUser = async () => {
    const { getToken } = useAuth();
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
      }); // Redirect to dashboard after login
    }
  }, [isSignedIn, router]);

  return (
    <div className="w-1/2 flex items-center justify-center p-12">
      <div className="max-w-sm w-full">
        {/* <h2 className="text-2xl font-bold text-[#13294B] mb-6">
          Sign in to your account
        </h2> */}
        <SignIn routing="hash" /> {/* ✅ Fix: Enables hash-based routing */}
      </div>
    </div>
  );
};

export default LoginPage;
