import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Sidebar from "..//components/Sidebar";
import Topbar from "..//components/Topbar";

export default function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    profileImage: "",
  });

  // Profile info for sidebar and topbar
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("authUser"));
    if (storedUser) {
      setFormData({
        fullName: storedUser.fullName || "",
        phone: storedUser.phoneNo || "", // assuming backend uses phoneNo key
        profileImage: storedUser.avatar || "", // backend uses avatar key
      });
      setProfileName(storedUser.fullName || "");
      setProfilePic(storedUser.avatar || "");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNo: formData.phone,
          avatar: formData.profileImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      localStorage.setItem("authUser", JSON.stringify(data.user));
      setProfileName(data.user.fullName || "");
      setProfilePic(data.user.avatar || "");

      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar profileName={profileName} />

      <div className="flex flex-col flex-1">
        <Topbar profileName={profileName} profilePic={profilePic} />

        <main className="flex-1 p-6 overflow-auto bg-white flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl space-y-4"
          >
            <h2 className="text-2xl font-bold text-center">Edit Profile</h2>

            {formData.profileImage && (
              <div className="flex justify-center">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border"
                />
              </div>
            )}

            <input
              type="url"
              name="profileImage"
              placeholder="Profile Image URL"
              value={formData.profileImage}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Save Changes
            </button>

            <p className="text-center text-sm">
              <a href="/profile" className="underline">
                Back to Profile
              </a>
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
