import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Header from "./components/header";
import LoginPage from "./components/loginpage";
import Dashboard from "./components/dashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<SignedIn><Dashboard /></SignedIn>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
