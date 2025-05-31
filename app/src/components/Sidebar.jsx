// src/components/Sidebar.jsx
import React from "react";

const Sidebar = ({ profileName }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Slateai</h1>
        <p className="mt-2 text-gray-600 font-medium">Hello, {profileName}</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <a
          href="/slateai"
          className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
        >
          Dashboard
        </a>

        <a
          href="#"
          className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
        >
          Projects
        </a>
        <a
          href="subscribe"
          className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
        >
          Subscriptions
        </a>
        <a
          href="#"
          className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition"
        >
          Settings
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
