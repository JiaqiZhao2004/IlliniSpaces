import React from "react";
interface HeaderProps {
  isLoggedIn: boolean;
  userEmail?: string;
}
export const Header: React.FC<HeaderProps> = ({ isLoggedIn, userEmail }) => {
  return (
    <header className="w-full bg-[#13294B] text-white border-b border-[#E84A27] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">IlliniSpaces</h1>
        {isLoggedIn && (
          <div className="text-sm">
            Signed in as <span className="text-[#E84A27]">{userEmail}</span>
          </div>
        )}
      </div>
    </header>
  );
};
