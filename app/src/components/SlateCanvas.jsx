// components/SlateCanvas.jsx
import React, { useRef } from "react";
import {
  Excalidraw,
  exportToSvg,
  serializeAsJSON,
  restore,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";



export default function SlateCanvas() {
  const excalidrawRef = useRef(null);

  const handleAskAI = async () => {
    if (!excalidrawRef.current) {
      alert("Canvas not ready");
      return;
    }

    const apiUrl = "http://localhost:5000/api/ai/ask"; // Adjust if needed
    const scene = excalidrawRef.current.getSceneElements();

    try {
      // Export SVG
      const svgElement = await exportToSvg({
        elements: scene,
        appState: { viewBackgroundColor: "#ffffff" },
        files: excalidrawRef.current.getFiles(),
      });

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = `data:image/svg+xml;base64,${btoa(svgString)}`; // <-- fixed backticks

      // Send SVG base64 to backend AI API
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svgBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI conversion failed");

      const { excalidrawData } = data; // expecting JSON scene from backend

      // Restore scene from JSON
      // 'restore' returns { elements, appState, files }
      const restoredData = restore(excalidrawData);

      // Update the canvas with new scene elements and app state
      excalidrawRef.current.updateScene({
        elements: restoredData.elements,
        appState: restoredData.appState,
        files: restoredData.files,
      });

      alert("Canvas updated from AI!");
    } catch (error) {
      console.error("Error:", error);
      alert(`AI error: ${error.message}`); // <-- fixed backticks
    }
  };

  return (
    <div style={{ height: "90vh" }}>
      <Excalidraw ref={excalidrawRef} />

      <button
        onClick={handleAskAI}
        style={{ margin: "1rem", padding: "10px 20px", fontSize: "16px" }}
      >
        Ask AI to Convert
      </button>
    </div>
  );
}
