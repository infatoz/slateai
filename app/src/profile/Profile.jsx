import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    profileImage: "",
    phone: "",
    role: "",
    bio: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("authUser")); // FIXED KEY

    if (storedUser) {
      setProfile({
        fullName: storedUser.fullName || "",
        email: storedUser.email || "",
        profileImage: storedUser.profileImage?.trim()
          ? storedUser.profileImage
          : "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(storedUser.fullName || "User") +
            "&background=000&color=fff",
        phone: storedUser.phone || "",
        role: storedUser.role || "",
        bio: storedUser.bio || "",
      });
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50 ">
      <Sidebar profileName={profile.fullName} />
      <div className="flex flex-col flex-1">
        <Topbar
          profileName={profile.fullName}
          profilePic={profile.profileImage}
        />

        <main className="flex-1 p-6 overflow-auto bg-white flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={profile.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-black"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {profile.fullName}
              </h2>
              <p className="text-sm text-gray-600">{profile.email}</p>
              {profile.bio && (
                <p className="text-center mt-2 text-gray-500 italic">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Phone:</strong> {profile.phone || "Not provided"}
              </p>
              <p>
                <strong>Role:</strong> {profile.role || "Not specified"}
              </p>
            </div>

            <a
              href="/edit-profile"
              className="block text-center underline text-sm text-gray-700"
            >
              Edit Profile
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
