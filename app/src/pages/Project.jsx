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
  const [description, setDescription] = useState("");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const firstLoadRef = useRef(true);

  // Load profile info on mount
  useEffect(() => {
    try {
      const storedAuthUser = localStorage.getItem("authUser");
      if (storedAuthUser) {
        const user = JSON.parse(storedAuthUser);
        setProfileName(user.fullName || "");
        setProfilePic(user.avatar || "");
      }
    } catch (err) {
      console.error("Failed to parse authUser:", err);
    }
  }, []);

  // Helper to get token robustly
  const getToken = () => {
    try {
      const storedAuthUser = localStorage.getItem("authUser");
      if (storedAuthUser) {
        const user = JSON.parse(storedAuthUser);
        if (user.accessToken) return user.accessToken;
        if (user.token) return user.token;
      }
      const directToken = localStorage.getItem("accessToken");
      if (directToken) return directToken;
    } catch (err) {
      console.error("Error retrieving token:", err);
    }
    return null;
  };

  // Fetch projects once on mount
  useEffect(() => {
    const localProjects = localStorage.getItem("projects");
    if (localProjects) {
      setProjects(JSON.parse(localProjects));
    } else {
      // fallback to backend fetch
      async function fetchProjects() {
        const token = getToken();
        try {
          const res = await fetch("http://localhost:5000/api/canvas/my", {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Unauthorized");

          const formatted = data.canvases.map((canvas) => ({
            id: canvas._id,
            name: canvas.title,
            description: canvas.description || "",
            visibility: canvas.isPublic ? "public" : "private",
            createdAt: canvas.createdAt || new Date().toISOString(),
          }));

          setProjects(formatted);
          localStorage.setItem("projects", JSON.stringify(formatted));
        } catch (err) {
          console.error("Failed to fetch projects:", err);
        }
      }
      fetchProjects();
    }
  }, []);
  

  // Update localStorage on projects change (skip first load)
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create new project
  const handleCreate = async () => {
    if (!name.trim()) return;

    const token = getToken();

    let newProject = null;

    try {
      const res = await fetch("http://localhost:5000/api/canvas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim(),
          isPublic: visibility === "public",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create canvas");

      newProject = {
        id: data.canvas._id,
        name: data.canvas.title,
        description: data.canvas.description || "",
        visibility: data.canvas.isPublic ? "public" : "private",
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Backend failed, storing locally:", err.message);

      newProject = {
        id: `local-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        visibility,
        createdAt: new Date().toISOString(),
      };
    }

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    setShowModal(false);
    setName("");
    setDescription("");
    setVisibility("public");
  };

  // Delete project
  const handleDelete = (id) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
  };

  // Navigate on project card click except dropdown
  const handleCardClick = (e, id) => {
    if (e.target.closest(".dropdown")) return;
    navigate(`/slateai/${id}`);
  };

  // Rename project
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar profileName={profileName} />

      <div className="flex flex-col flex-1">
        <Topbar profileName={profileName} profilePic={profilePic} />

        <main className="flex-1 p-8 overflow-auto">
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
                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}

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
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create Project Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 relative">
                <h2 className="text-xl font-semibold mb-4">
                  Create New Project
                </h2>

                <input
                  type="text"
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full mb-5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rename Modal */}
          {showRenameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-80 relative">
                <h2 className="text-xl font-semibold mb-4">Rename Project</h2>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full mb-5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New project name"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowRenameModal(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Rename
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
