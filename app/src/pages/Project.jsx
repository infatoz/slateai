import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [dropdownId, setDropdownId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const storedAuthUser = localStorage.getItem("authUser");
    if (storedAuthUser) {
      try {
        const user = JSON.parse(storedAuthUser);
        setProfileName(user.fullName || "");
        setProfilePic(user.profileImage || "");
      } catch (err) {
        console.error("Failed to parse authUser from localStorage", err);
      }
    }
  });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const firstLoadRef = useRef(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("projects")) || [];
    setProjects(saved);
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

//   const handleCreate = () => {
//     if (!name.trim()) return;
//     const newProject = {
//       id: Date.now(),
//       name: name.trim(),
//       visibility,
//     };
//     const updatedProjects = [...projects, newProject];
//     localStorage.setItem("projects", JSON.stringify(updatedProjects));
//     setProjects(updatedProjects);
//     setShowModal(false);
//     setName("");
//     setVisibility("public");
//   };
const handleCreate = () => {
  if (!name.trim()) return;
  const newProject = {
    id: Date.now(),
    name: name.trim(),
    visibility,
    createdAt: new Date().toISOString(), // ✅ Add this
  };
  const updatedProjects = [newProject, ...projects];

  localStorage.setItem("projects", JSON.stringify(updatedProjects));
  setProjects(updatedProjects);
  setShowModal(false);
  setName("");
  setVisibility("public");
};
  
  const handleDelete = (id) => {
    const updated = projects.filter((p) => p.id !== id);
    localStorage.setItem("projects", JSON.stringify(updated));
    setProjects(updated);
  };

  const handleCardClick = (e, id) => {
    if (e.target.closest(".dropdown")) return;
    navigate(`/slateai/${id}`);
  };
  const handleRename = () => {
    if (!renameValue.trim()) return;

    const updated = projects.map((p) =>
      p.id === renameId ? { ...p, name: renameValue.trim() } : p
    );

    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
    setShowRenameModal(false);
    setRenameId(null);
    setRenameValue("");
  };
  
  // --- Wrap with Sidebar and Topbar here ---
  return (
    <div className="flex h-screen bg-gray-100">
      {/* or pass a real name if you have it */}
      <Sidebar profileName={profileName} />

      <div className="flex flex-col flex-1">
        {/* <Topbar profileName="User" /> */}
        <Topbar profileName={profileName} profilePic={profilePic} />

        <main className="flex-1 p-8 overflow-auto">
          {/* === Original project JSX content below === */}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your Projects</h1>
            <button
              className="bg-transparent border border-blue-600 text-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-50 transition font-medium"
              onClick={() => setShowModal(true)}
            >
              + Create New
            </button>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                onClick={(e) => handleCardClick(e, project.id)}
              >
                <div className="h-40 bg-gray-50 flex items-center justify-center text-gray-300 text-sm font-light">
                  [ Image Placeholder ]
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {project.name}
                  </h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {project.visibility}
                  </p>
                  {project.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(project.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div
                  className="absolute top-3 right-3 dropdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownId(
                      dropdownId === project.id ? null : project.id
                    );
                  }}
                >
                  <button className="text-gray-400 hover:text-gray-800 text-2xl font-light leading-none">
                    ⋮
                  </button>

                  {dropdownId === project.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-sm"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameId(project.id);
                          setRenameValue(project.name);
                          setShowRenameModal(true);
                          setDropdownId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Share feature coming soon!");
                          setDropdownId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                      >
                        Share
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                          setDropdownId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Create New Project
                </h2>

                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-6 justify-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                    />
                    Private
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition font-medium"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                    onClick={handleCreate}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
          {showRenameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Rename Project
                </h2>

                <input
                  type="text"
                  placeholder="New Project Name"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition font-medium"
                    onClick={() => setShowRenameModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
                    onClick={handleRename}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
