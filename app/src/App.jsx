import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./App.css";
import { useState, useEffect, useRef } from "react";
import { data } from "./data/api/data";
import { UIOptions } from "./constants/constants";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const STORAGE_KEY = "excalidraw-data";


function App() {
  const [initialData, setInitialData] = useState(null);
  const excalidrawRef = useRef(null);

  // States for profile info
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // useEffect(() => {
  //   // Load all profile info from localStorage dynamically
  //   const storedName = localStorage.getItem("profileName") || "";
  //   const storedPic = localStorage.getItem("profilePic") || "";
  //   const storedEmail = localStorage.getItem("profileEmail") || "";

  //   setProfileName(storedName);
  //   setProfilePic(storedPic);
  //   setProfileEmail(storedEmail);

  //   // Load drawing data
  //   const savedData = localStorage.getItem(STORAGE_KEY);
  //   if (savedData) {
  //     try {
  //       const parsed = JSON.parse(savedData);
  //       if (
  //         parsed.appState &&
  //         parsed.appState.collaborators &&
  //         !(parsed.appState.collaborators instanceof Map)
  //       ) {
  //         parsed.appState.collaborators = new Map(
  //           Object.entries(parsed.appState.collaborators)
  //         );
  //       }
  //       setInitialData(parsed);
  //     } catch (e) {
  //       console.error("Invalid saved data. Using fallback.");
  //       setInitialData(data[0]);
  //     }
  //   } else {
  //     setInitialData(data[0]);
  //   }
  // }, []);
  useEffect(() => {
    // Get the whole authUser object as JSON string from localStorage
    const storedAuthUser = localStorage.getItem("authUser");
    if (storedAuthUser) {
      try {
        const user = JSON.parse(storedAuthUser);
        setProfileName(user.fullName || "");
        setProfilePic(user.profileImage || "");
        setProfileEmail(user.email || "");
      } catch (err) {
        console.error("Failed to parse authUser from localStorage", err);
      }
    } else {
      // fallback if nothing in localStorage
      setProfileName("");
      setProfilePic("");
      setProfileEmail("");
    }

    // Load drawing data as before
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (
          parsed.appState &&
          parsed.appState.collaborators &&
          !(parsed.appState.collaborators instanceof Map)
        ) {
          parsed.appState.collaborators = new Map(
            Object.entries(parsed.appState.collaborators)
          );
        }
        setInitialData(parsed);
      } catch (e) {
        console.error("Invalid saved data. Using fallback.");
        setInitialData(data[0]);
      }
    } else {
      setInitialData(data[0]);
    }
  }, []);
  
  const handleChange = (elements, appState) => {
    const collaborators =
      appState.collaborators instanceof Map
        ? Object.fromEntries(appState.collaborators)
        : {};

    const updatedData = {
      elements,
      appState: {
        ...appState,
        collaborators,
      },
      scrollToContent: true,
    };

    console.log("Updated Drawing Data:", updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar profileName={profileName} />
      <div className="flex flex-col flex-1">
        <Topbar profileName={profileName} profilePic={profilePic} />

        <main className="flex-1 p-6 overflow-auto bg-white">
          {initialData && (
            <Excalidraw
              ref={excalidrawRef}
              initialData={initialData}
              onChange={handleChange}
              UIOptions={UIOptions}
            />
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
