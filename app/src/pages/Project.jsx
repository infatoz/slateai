import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar"; // Assuming Topbar.jsx is in ../components/
import Sidebar from "../components/Sidebar"; // Assuming Sidebar.jsx is in ../components/

const API_BASE_URL = "http://localhost:5000/api/canvas";

export default function Project() {
  const [canvases, setCanvases] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState(""); // Renamed from 'name' for clarity
  const [description, setDescription] = useState(""); // Added for create modal
  const [isPublic, setIsPublic] = useState(false); // Changed from 'visibility' to boolean

  const [dropdownId, setDropdownId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fetch profile info on mount
  useEffect(() => {
    const storedAuthUser = localStorage.getItem("authUser");
    if (storedAuthUser) {
      try {
        const user = JSON.parse(storedAuthUser);
        setProfileName(user.fullName || "User");
        setProfilePic(user.profileImage || "");
      } catch (err) {
        console.error("Failed to parse authUser from localStorage", err);
        setProfileName("User"); // Fallback
      }
    } else {
      setProfileName("User"); // Fallback if no user in localStorage
    }
  }, []); // Empty dependency array: runs once on mount

  // Fetch canvases from API
  const fetchCanvases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/my`, {
        method: "GET",
        headers: {
          // Cookies are best handled by the browser with `credentials: 'include'`
          // 'Cookie': `accessToken=${localStorage.getItem('accessToken')}; refreshToken=${localStorage.getItem('refreshToken')}` // Example if manual cookie header was needed and possible
        },
        credentials: "include", // Important for sending HttpOnly cookies
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to fetch canvases: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      setCanvases(data.canvases || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setCanvases([]); // Clear canvases on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, []); // Fetch on component mount

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Canvas title cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          isPublic: isPublic,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to create canvas: ${errorData.message || response.statusText}`);
      }
      // const newCanvas = await response.json(); // Contains the created canvas
      await fetchCanvases(); // Refresh the list
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setIsPublic(false);
    } catch (err) {
      console.error(err);
      setError(err.message); // Consider showing this to the user
      alert(`Error creating canvas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this canvas?")) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          headers: {},
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`Failed to delete canvas: ${errorData.message || response.statusText}`);
        }
        // setCanvases((prevCanvases) => prevCanvases.filter((p) => p._id !== id)); // Optimistic update
        await fetchCanvases(); // Or refetch
      } catch (err) {
        console.error(err);
        setError(err.message);
        alert(`Error deleting canvas: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCardClick = (e, id) => {
    if (e.target.closest(".dropdown-trigger") || e.target.closest(".dropdown-menu")) return;
    navigate(`/slateai/${id}`);
  };

  const handleOpenRenameModal = (canvas) => {
    setRenameId(canvas._id);
    setRenameValue(canvas.title);
    // If editing more fields, set them here from canvas.description, canvas.isPublic
    setShowRenameModal(true);
    setDropdownId(null);
  };
  
  const handleRename = async () => {
    if (!renameValue.trim()) {
        alert("Canvas title cannot be empty.");
        return;
    }
    if (!renameId) return;

    // Find the original canvas to get its current description and isPublic status
    // as the API expects all fields for update.
    const canvasToUpdate = canvases.find(c => c._id === renameId);
    if (!canvasToUpdate) {
        alert("Could not find canvas to update.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${renameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: renameValue.trim(),
          description: canvasToUpdate.description, // Send existing description
          isPublic: canvasToUpdate.isPublic,     // Send existing visibility
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to update canvas: ${errorData.message || response.statusText}`);
      }
      await fetchCanvases(); // Refresh list
      setShowRenameModal(false);
      setRenameId(null);
      setRenameValue("");
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Error renaming canvas: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar profileName={profileName} />
      <div className="flex flex-col flex-1">
        <Topbar profileName={profileName} profilePic={profilePic} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Your Canvases</h1>
            <button
              className="bg-transparent border border-blue-600 text-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-50 transition font-medium"
              onClick={() => {
                setShowCreateModal(true);
                // Reset fields for new canvas
                setTitle("");
                setDescription("");
                setIsPublic(false);
              }}
            >
              + Create New Canvas
            </button>
          </div>

          {isLoading && <p className="text-center text-gray-600">Loading canvases...</p>}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          
          {!isLoading && !error && canvases.length === 0 && (
            <p className="text-center text-gray-500 text-lg">No canvases found. Get started by creating one!</p>
          )}

          {!isLoading && !error && canvases.length > 0 && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {canvases.map((canvas) => (
                <div
                  key={canvas._id}
                  className="relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={(e) => handleCardClick(e, canvas._id)}
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-light">
                    {canvas.image ? (
                      <img src={canvas.image} alt={canvas.title} className="object-cover w-full h-full" />
                    ) : (
                      <span>[ No Thumbnail ]</span>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 truncate" title={canvas.title}>
                      {canvas.title}
                    </h2>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {canvas.isPublic ? "Public" : "Private"}
                    </p>
                    {canvas.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(canvas.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div
                    className="absolute top-3 right-3 dropdown-trigger" // Added class for clarity
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownId(
                        dropdownId === canvas._id ? null : canvas._id
                      );
                    }}
                  >
                    <button className="text-gray-400 hover:text-gray-800 text-2xl font-light leading-none p-1 rounded-full hover:bg-gray-100">
                      ⋮
                    </button>

                    {dropdownId === canvas._id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10 dropdown-menu" // Added z-index
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRenameModal(canvas);
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
                            handleDelete(canvas._id);
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
          )}

          {/* Create Canvas Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Create New Canvas
                </h2>
                <input
                  type="text"
                  placeholder="Canvas Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <div className="flex gap-6 justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      value="false" // string value for radio, convert to boolean on use
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    Private
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      value="true" // string value for radio
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    Public
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition font-medium"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    onClick={handleCreate}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rename Canvas Modal */}
          {showRenameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-5 shadow-xl">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Rename Canvas
                </h2>
                <input
                  type="text"
                  placeholder="New Canvas Title"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* If you want to edit description and visibility here, add more fields */}
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition font-medium"
                    onClick={() => setShowRenameModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    onClick={handleRename}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
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