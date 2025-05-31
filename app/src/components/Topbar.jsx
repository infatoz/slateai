// src/components/Topbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../auth/auth";

const Topbar = ({ profileName, profilePic }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("profileName");
    localStorage.removeItem("profilePic");
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome Back, {profileName}!
        </h2>
      </div>
      <div className="flex items-center space-x-4 relative">
        <button
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Notifications"
        >
          {/* Dummy bell icon */}
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>

        {/* Profile dropdown on hover */}
        <div className="relative group">
          <img
            className="h-10 w-10 rounded-full object-cover border border-gray-300 cursor-pointer"
            src={profilePic}
            alt="User Profile"
            title="User Menu"
          />

          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-200 z-50">
            <Link
              to="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
