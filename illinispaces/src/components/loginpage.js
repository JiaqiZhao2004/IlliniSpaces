// src/components/LoginPage.js
import React from "react";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import "./loginpage.css";

const LoginPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  if (isSignedIn) {
    navigate("/dashboard");
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Welcome to IlliniSpaces</h2>
        <p>
          IlliniSpaces helps students and organizations find and reserve
          available meeting rooms on campus. With real-time scheduling data and
          an interactive map, users can filter spaces by availability, capacity,
          and location for a seamless booking experience.
        </p>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Sign in to your account</h2>
          <SignInButton mode="modal">
            <button className="google-login-btn">Sign in with Google</button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
