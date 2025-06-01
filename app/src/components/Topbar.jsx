  import React, { useContext, useState, useEffect, useRef } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { logoutUser } from "../auth/auth";
  import { ThemeContext } from "../context/ThemeContext";

  const Topbar = ({
    profileName,
    profilePic,
    tabs = [],
    activeTabId,
    switchTab,
    createNewTab,
    closeTab,
  }) => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST", // or 'PUT'/'DELETE' depending on your backend
          credentials: "include", // send cookies if you use cookie-based auth
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          // Logout successful, clear local storage and redirect
          logoutUser()
          localStorage.removeItem("profileName");
          localStorage.removeItem("profilePic");
          navigate("/");
        } else {
          alert(data.message || "Logout failed");
        }
      } catch (error) {
        alert("Server error, try again later");
      }
    };
    

    // Close dropdown if clicked outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative flex items-center group">
              <button
                onClick={() => switchTab(tab.id)}
                className={`px-3 py-1 rounded-t-md border flex items-center ${
                  activeTabId === tab.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                {tab.name}
              </button>

              {/* Close X Button */}
              <button
                onClick={() => closeTab(tab.id)}
                className="absolute -right-2 -top-1 text-gray-500 hover:text-red-600 text-xs bg-white border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center group-hover:visible invisible"
                title="Close Tab"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={createNewTab}
            className="px-3 py-1 rounded-t-md border bg-green-100 hover:bg-green-200 border-green-400"
          >
            {/* ＋ */}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome Back, {profileName}!
          </h2>
        </div>

        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {/* Profile picture button */}
          <img
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="h-10 w-10 rounded-full object-cover border border-gray-300 cursor-pointer"
            src={profilePic}
            alt="User Profile"
            title="User Menu"
          />

          {/* Dropdown menu, toggled on click */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)} // close on link click
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
    );
  };

  export default Topbar;
