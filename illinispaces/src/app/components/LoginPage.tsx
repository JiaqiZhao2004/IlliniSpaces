import React, { useState } from "react";

interface LoginPageProps {
  onLogin: (email: string) => void; // ✅ Define the expected prop
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email);
    }
  };

  return (
    <div className="w-1/2 flex items-center justify-center p-12">
      <div className="max-w-sm w-full">
        <h2 className="text-2xl font-bold text-[#13294B] mb-6">
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter your @illinois.edu email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#13294B]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-[#E84A27] text-white p-3 rounded-md font-semibold hover:bg-[#C0392B]"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; // ✅ Ensure default export
