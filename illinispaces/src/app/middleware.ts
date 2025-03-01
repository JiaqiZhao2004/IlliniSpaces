import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(() => {
  return NextResponse.next();
});

// Enable Clerk for all routes
export const config = { matcher: "/((?!.*\\..*|_next).*)" };
