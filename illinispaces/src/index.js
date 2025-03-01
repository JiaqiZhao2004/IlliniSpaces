import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Clerk Publishable Key from environment variables
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
