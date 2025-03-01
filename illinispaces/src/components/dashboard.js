// src/components/Dashboard.js
import React from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to IlliniSpaces Dashboard</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.primaryEmailAddress.emailAddress}</p>
          <img src={user.imageUrl} alt="Profile" style={{ borderRadius: "50%" }} />
          <br />
          <SignOutButton signOutCallback={() => navigate("/")}>
            <button style={{ padding: "10px", marginTop: "20px" }}>Logout</button>
          </SignOutButton>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
