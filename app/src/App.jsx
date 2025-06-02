import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { exportToClipboard } from "@excalidraw/excalidraw";

import "./App.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

function svgToBase64(svgElement) {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const encoded = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${encoded}`;
}

function App() {
  const excalidrawRef = useRef(null);
  const { canvasId } = useParams();
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const [initialData, setInitialData] = useState(null);
  const [canvasTitle, setCanvasTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showAiSidebar, setShowAiSidebar] = useState(false);

  // Fetch canvas data on load
  useEffect(() => {
    if (!canvasId) return;

    async function fetchCanvas() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:5000/api/canvas/${canvasId}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok)
          throw new Error(`Failed to fetch canvas: ${res.statusText}`);

        const json = await res.json();
        const excalidrawData = json.canvas?.excalidrawData || null;

        if (excalidrawData) {
          if (
            excalidrawData.appState &&
            excalidrawData.appState.collaborators &&
            !(excalidrawData.appState.collaborators instanceof Map)
          ) {
            excalidrawData.appState.collaborators = new Map(
              Object.entries(excalidrawData.appState.collaborators)
            );
          }
          setInitialData(excalidrawData);
          setCanvasTitle(json.canvas.title || "");
        } else {
          setInitialData(null);
          setError("No drawing data found in canvas");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCanvas();
  }, [canvasId]);

  const handleAskAI = async () => {
    console.log("Excalidraw API:", excalidrawAPI?.getAppState());

    console.log("Ask AI clicked");

    if (!excalidrawAPI) {
      console.error("excalidrawAPI is null");
      return;
    }

    // if (typeof excalidrawAPI.getSceneAsSvg !== "function") {
    //   console.error("getSceneAsSvg is not a function on excalidrawAPI");
    //   return;
    // }

    setAiLoading(true);
    setAiResponse(null);
    setShowAiSidebar(true);

    try {
      const svg = await exportToSvg({
        elements: excalidrawAPI?.getSceneElements(),
        appState: excalidrawAPI?.getAppState(),
        files: excalidrawAPI?.getFiles(),
      });

      const base64Svg = svgToBase64(svg);
      console.log("Base64 Data URL:", base64Svg);

      const res = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ svgBase64: base64Svg }),
      });

      if (!res.ok) {
        throw new Error(`AI API error: ${res.statusText}`);
      }

      const json = await res.json();
      setAiResponse(json.result || "No AI response");
    } catch (err) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Handler for Ask AI button
  // const handleAskAI = async () => {

  //   console.log("Ask AI clicked");
  //   if (!excalidrawRef.current) {
  //     console.error("excalidrawRef is null");
  //     return;
  //   }
  //   if (typeof excalidrawRef.current.getSceneAsSvg !== "function") {
  //     console.error("getSceneAsSvg is not a function on excalidrawRef.current");
  //     return;
  //   }

  //   setAiLoading(true);
  //   setAiResponse(null);
  //   setShowAiSidebar(true);

  //   try {
  //     // Export current scene to SVG string
  //     const svgString = await excalidrawRef.current.getSceneAsSvg();

  //     // Convert SVG string to base64
  //     const base64Svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

  //     // Call your AI API
  //     const res = await fetch("http://localhost:5000/api/ai/ask", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // cookies sent automatically if credentials include used and backend supports CORS credentials
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({ svgBase64: base64Svg }),
  //     });

  //     if (!res.ok) {
  //       throw new Error(`AI API error: ${res.statusText}`);
  //     }

  //     const json = await res.json();
  //     setAiResponse(json.result || "No AI response");
  //   } catch (err) {
  //     setAiResponse(`Error: ${err.message}`);
  //   } finally {
  //     setAiLoading(false);
  //   }
  // };

  const handleSaveCanvas = async () => {
  if (!excalidrawAPI) {
    console.error("Excalidraw API not available");
    return;
  }

  const elements = excalidrawAPI.getSceneElements();
  const appState = excalidrawAPI.getAppState();
  const files = excalidrawAPI.getFiles();

  const data = {
    elements,
    appState,
    files,
  };

  try {
    const res = await fetch(`http://localhost:5000/api/canvas/${canvasId}/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Save failed: ${res.statusText}`);

    alert("Canvas saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to save canvas.");
  }
};

  if (loading) return <div className="p-4">Loading canvas...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      {/* Topbar */}
      <header className="flex items-center justify-between bg-white p-4 shadow border-b">
        <h1 className="text-xl font-semibold">
          {canvasTitle || "Untitled Canvas"}
        </h1>
        <button
          onClick={handleAskAI}
          disabled={aiLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {aiLoading ? "Asking AI..." : "Ask AI"}
        </button>
        <button
      onClick={handleSaveCanvas}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Save
    </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Excalidraw canvas */}
        <main
          className={`flex-1 ${
            showAiSidebar ? "max-w-3xl" : "w-full"
          } overflow-auto bg-white`}
        >
          {initialData ? (
            <Excalidraw
              key={canvasId}
              ref={excalidrawRef}
              initialData={initialData}
              style={{ height: "100%", width: "100%" }}
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
            />
          ) : (
            <p className="p-4">No canvas data to display</p>
          )}
        </main>

        {/* AI Sidebar */}
        {showAiSidebar && (
          <aside className="w-96 bg-gray-100 border-l p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">AI Response</h2>
              <button
                onClick={() => setShowAiSidebar(false)}
                className="text-gray-600 hover:text-gray-900 font-bold"
                aria-label="Close AI sidebar"
              >
                ×
              </button>
            </div>

            {aiLoading && <p>Loading AI response...</p>}

            {aiResponse && (
              <pre className="whitespace-pre-wrap text-gray-800">
                {aiResponse}
              </pre>
            )}

            {!aiLoading && !aiResponse && (
              <p>No response yet. Click "Ask AI".</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
