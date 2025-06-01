import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./App.css";
import { useState, useEffect, useRef } from "react";
import { data } from "./data/api/data";
import { UIOptions } from "./constants/constants";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

function App() {
  const excalidrawRef = useRef(null);

  // Profile states
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Tabs state
  const [tabs, setTabs] = useState(() => {
    const savedTabs = JSON.parse(localStorage.getItem("tabs")) || [
      { id: "tab-1", name: "Untitled", storageKey: "excalidraw-tab-1" },
    ];
    return savedTabs;
  });

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [initialData, setInitialData] = useState(null);

  // Load user profile and current tab data
  useEffect(() => {
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
    }

    const currentTab = tabs.find((t) => t.id === activeTabId);
    const savedData = localStorage.getItem(currentTab.storageKey);
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
  }, [activeTabId]);

  // Handle drawing changes and save to current tab's localStorage key
  const handleChange = (elements, appState) => {
    const collaborators =
      appState.collaborators instanceof Map
        ? Object.fromEntries(appState.collaborators)
        : {};

    const updatedData = {
      elements,
      appState: { ...appState, collaborators },
      scrollToContent: true,
    };

    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab) {
      localStorage.setItem(currentTab.storageKey, JSON.stringify(updatedData));
    }
  };

  // Switch between tabs
  const switchTab = (tabId) => {
    setActiveTabId(tabId);
  };

  // Create new drawing tab
  const createNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      name: `Untitled ${tabs.length + 1}`,
      storageKey: `excalidraw-${newId}`,
    };

    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(newId);
    localStorage.setItem("tabs", JSON.stringify(updatedTabs));

    // Create empty canvas for the new tab
    localStorage.setItem(
      newTab.storageKey,
      JSON.stringify({ elements: [], appState: {}, scrollToContent: true })
    );
  };
  const closeTab = (tabId) => {
    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
    localStorage.setItem("tabs", JSON.stringify(updatedTabs));
    localStorage.removeItem(`excalidraw-${tabId}`); // optional: clean up data

    // If the closed tab is active, switch to another one
    if (tabId === activeTabId && updatedTabs.length > 0) {
      setActiveTabId(updatedTabs[0].id);
    }

    setTabs(updatedTabs);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <Sidebar profileName={profileName} />
      <div className="flex flex-col flex-1">
        <Topbar
          profileName={profileName}
          profilePic={profilePic}
          tabs={tabs}
          activeTabId={activeTabId}
          switchTab={switchTab}
          createNewTab={createNewTab}
          closeTab={closeTab} // 👈 added
        />

        <main className="flex-1 p-6 overflow-auto bg-white">
          {initialData && (
            <Excalidraw
              key={activeTabId} // 👈 This forces remount when tab changes
              ref={excalidrawRef}
              initialData={initialData}
              onChange={handleChange}
              // UIOptions={UIOptions}
            />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
