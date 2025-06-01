import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST", // or DELETE if your API uses that
          credentials: "include", // important if using cookies for auth
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          // Clear any client-side data if you use localStorage/sessionStorage
          localStorage.removeItem("profileName");
          localStorage.removeItem("profilePic");
          // Redirect to home or login page
          navigate("/login");
        } else {
          alert(data.message || "Failed to logout");
        }
      } catch (error) {
        alert("Server error. Please try again.");
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-semibold">Logging out...</p>
    </div>
  );
}
