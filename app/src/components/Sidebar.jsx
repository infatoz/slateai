import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Sidebar = ({ profileName }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/project" },
    { name: "Subscriptions", path: "/subscribe" },
    { name: "Settings", path: "/settings" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Button - visible on all devices */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="text-gray-800 p-2 bg-white border rounded shadow"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-md z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-6 py-8 flex flex-col h-full">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Slateai
            </h1>
            <p className="mt-1 text-gray-600 font-medium text-base">
              Hello, {profileName}
            </p>
          </div>

          <nav className="flex-1 px-2 space-y-1 text-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block rounded-md px-4 py-2 font-medium transition duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                  onClick={() => setIsOpen(false)} // Close sidebar on nav click
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
