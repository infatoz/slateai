import { Excalidraw } from "@excalidraw/excalidraw";
import '@excalidraw/excalidraw/index.css';
import './App.css';
import { useState, useEffect, useRef } from "react";
import { data } from "./data/api/data";
import { UIOptions } from "./constants/constants";

const STORAGE_KEY = "excalidraw-data";

function App() {
  const [initialData, setInitialData] = useState(null);
  const excalidrawRef = useRef(null);

useEffect(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.appState && parsed.appState.collaborators) {
        parsed.appState.collaborators = new Map(Object.entries(parsed.appState.collaborators));
      }
      setInitialData(parsed);
    } catch (e) {
      console.error("Invalid saved data. Using fallback.");
      setInitialData(data[0]);
    }
  } else {
    setInitialData(data[0]);
  }
}, []); // ✅ Runs only once on mount

const handleChange = (elements, appState) => {
  // Convert collaborators Map to plain object before saving
  const collaborators = appState.collaborators instanceof Map
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
    <div style={{ height: "100vh" }} className="custom-styles">
      {initialData && (
        <Excalidraw
          ref={excalidrawRef}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={UIOptions}
        />
      )}
    </div>
  );
}

export default App;
