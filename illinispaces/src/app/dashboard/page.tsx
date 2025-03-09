"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { SecondaryNavBar } from "../components/SecondaryNavBar";
const DynamicCampusMap = dynamic(() => import("../components/CampusMap"), {
  ssr: false,
});

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <SecondaryNavBar selectedId={0} />
      <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
      <p className="text-lg mt-2">You are now logged into IlliniSpaces.</p>
      <SignOutButton />
      <DynamicCampusMap />
    </div>
  );
}
