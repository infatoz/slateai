import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Excalidraw,
  exportToSvg,
  exportToBlob,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import ReactMarkdown from "react-markdown";

const API_BASE_URL = "http://localhost:5000/api";

// Helper to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function SlateCanvas({ onSaveTrigger }) {
  const { canvasId } = useParams();
  const excalidrawRef = useRef(null);

  // Initialize initialData with a default structure
  const [initialData, setInitialData] = useState({ elements: [], appState: {}, files: {} });
  const [canvasTitle, setCanvasTitle] = useState("Canvas");
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [error, setError] = useState(null);
  const [isCanvasApiReady, setIsCanvasApiReady] = useState(false); 

  const [aiResponse, setAiResponse] = useState("");
  const [showAiSidebar, setShowAiSidebar] = useState(false);

  // Fetch initial canvas data
  const fetchCanvasData = useCallback(async () => {
    console.log("fetchCanvasData called. canvasId:", canvasId);
    if (!canvasId) {
      setError("No Canvas ID provided in URL.");
      setIsLoading(false);
      // initialData is already defaulted, ensure API ready is false
      setIsCanvasApiReady(false); 
      console.log("fetchCanvasData: No canvasId. Using default initialData. isLoading:", false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsCanvasApiReady(false); 
    try {
      const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to fetch canvas data: ${errData.message || response.statusText} (Status: ${response.status})`);
      }
      const data = await response.json();
      if (data.canvas) {
        let excalidrawJsonData = data.canvas.excalidrawData;
        console.log("Fetched excalidrawData from API:", excalidrawJsonData);

        // Ensure excalidrawJsonData is a valid object, defaulting if not.
        if (!excalidrawJsonData || typeof excalidrawJsonData !== 'object') {
            console.warn("API excalidrawData is null or not an object, defaulting.");
            excalidrawJsonData = { elements: [], appState: {}, files: {} };
        }
        // Ensure essential properties exist
        if (!excalidrawJsonData.appState || typeof excalidrawJsonData.appState !== 'object') {
            excalidrawJsonData.appState = {};
        }
        if (!Array.isArray(excalidrawJsonData.elements)) {
            excalidrawJsonData.elements = [];
        }
        if (!excalidrawJsonData.files || typeof excalidrawJsonData.files !== 'object') {
            excalidrawJsonData.files = {};
        }

        if (
          excalidrawJsonData.appState.collaborators &&
          !(excalidrawJsonData.appState.collaborators instanceof Map)
        ) {
          if (typeof excalidrawJsonData.appState.collaborators === 'object' && excalidrawJsonData.appState.collaborators !== null) {
            console.log("Converting collaborators object to Map.");
            excalidrawJsonData.appState.collaborators = new Map(
              Object.entries(excalidrawJsonData.appState.collaborators)
            );
          } else {
            // If collaborators is present but not a valid object (e.g. null, string), remove or default it
            console.warn("Collaborators is not a valid object for Map conversion, defaulting.");
            excalidrawJsonData.appState.collaborators = new Map(); 
          }
        }
        
        console.log("Processed initialData to be set:", excalidrawJsonData);
        setInitialData(excalidrawJsonData);
        setCanvasTitle(data.canvas.title || "Untitled Canvas");
      } else {
        throw new Error("Canvas data not found in response.");
      }
    } catch (err) {
      console.error("Fetch Canvas Data Error:", err);
      setError(err.message);
      // Reset to default on error to ensure Excalidraw can still render
      setInitialData({ elements: [], appState: {}, files: {} }); 
    } finally {
      setIsLoading(false);
      console.log("fetchCanvasData finished. isLoading:", false);
    }
  }, [canvasId]);

  useEffect(() => {
    fetchCanvasData();
  }, [fetchCanvasData]); // Re-run if canvasId changes (via fetchCanvasData dependency)

  const handleCanvasChange = (elements, appState, files) => {
    // console.log("Canvas changed (elements, appState, files):", elements, appState, files);
  };

  const handleSaveCanvas = async () => {
    if (!isCanvasApiReady) { 
      alert("Canvas is not fully ready. Please wait a moment and try again.");
      return;
    }
    if(!canvasId){
      alert("Canvas ID is missing. Cannot save.");
      return;
    }
    if (!excalidrawRef.current) {
        alert("Internal error: Canvas reference is not available despite readiness check.");
        return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const elements = excalidrawRef.current.getSceneElements();
      const appStateFromExcalidraw = excalidrawRef.current.getAppState();
      const files = excalidrawRef.current.getFiles(); 

      const collaboratorsObject = appStateFromExcalidraw.collaborators instanceof Map
        ? Object.fromEntries(appStateFromExcalidraw.collaborators)
        : (appStateFromExcalidraw.collaborators || {});

      const processedAppState = {
          ...appStateFromExcalidraw,
          collaborators: collaboratorsObject,
      };

      const blob = await exportToBlob({
        elements,
        appState: appStateFromExcalidraw, 
        files,
        mimeType: "image/png",
        exportPadding: 10, 
      });
      const imageBase64 = await blobToBase64(blob);

      const payload = {
        elements,
        appState: processedAppState, 
        image: imageBase64,
      };

      const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to save canvas: ${errData.message || response.statusText}`);
      }
      alert("Canvas saved successfully!");
    } catch (err) {
      console.error("Error saving canvas:", err);
      setError(err.message);
      alert(`Error saving canvas: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    if (onSaveTrigger && isCanvasApiReady) { 
      // handleSaveCanvas(); 
    }
  }, [onSaveTrigger, isCanvasApiReady]);


  const handleAskAI = async () => {
    if (!isCanvasApiReady) { 
      alert("Canvas is not fully ready. Please wait a moment and try again.");
      return;
    }
    if (!excalidrawRef.current) {
        alert("Internal error: Canvas reference is not available despite readiness check.");
        return;
    }

    setIsAskingAI(true);
    setError(null);
    setAiResponse(""); 

    try {
      const sceneElements = excalidrawRef.current.getSceneElements();
      const appState = excalidrawRef.current.getAppState(); 
      const files = excalidrawRef.current.getFiles();

      if (sceneElements.length === 0) {
        alert("Canvas is empty. Draw something to ask AI.");
        setIsAskingAI(false);
        return;
      }
      
      const svgElement = await exportToSvg({
        elements: sceneElements,
        appState: { ...appState, viewBackgroundColor: "#ffffff" }, 
        files: files,
        exportPadding: 10, 
      });

      const svgString = new XMLSerializer().serializeToString(svgElement);
      if (!svgString || svgString.trim() === "") {
          throw new Error("Generated SVG string is empty.");
      }
      const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

      const res = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ svgBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI conversion failed");

      setAiResponse(data.result || "No result from AI.");
      setShowAiSidebar(true);
    } catch (error) {
      console.error("Error asking AI:", error);
      setError(error.message);
      alert(`AI error: ${error.message}`);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleSpeakAIResponse = () => {
    if (aiResponse && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiResponse);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("AI response is empty or Text-to-Speech is not supported.");
    }
  };

  const handleCopyAIResponse = () => {
    if (aiResponse) {
        const textArea = document.createElement("textarea");
        textArea.value = aiResponse;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert("AI response copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy using execCommand:", err);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(aiResponse)
                    .then(() => alert("AI response copied to clipboard!"))
                    .catch(clipErr => {
                        console.error("Failed to copy with navigator.clipboard:", clipErr);
                        alert("Failed to copy response.");
                    });
            } else {
                alert("Failed to copy response. Please try manually.");
            }
        }
        document.body.removeChild(textArea);
    } else {
      alert("AI response is empty.");
    }
  };

  // Log states right before rendering the main return
  // console.log("Render states:", { isLoading, isCanvasApiReady, initialDataIsSet: !!initialData, canvasId });

  if (isLoading) { // Simplified loading check, Excalidraw will only render when !isLoading and initialData is set
    return <div className="flex justify-center items-center h-[calc(100vh-60px)] text-lg">Loading Canvas...</div>;
  }
  if (!canvasId && !isLoading) { // This condition might be hit if canvasId was initially missing
     return <div className="text-red-500 text-center mt-5 text-lg">Error: No Canvas ID found in URL. Cannot load canvas.</div>;
  }
   if (error && !isLoading) { // Show error if fetch failed, after loading is complete
     return <div className="text-red-500 text-center mt-5 text-lg">Error loading canvas: {error}</div>;
  }
  
  return (
    <div className="flex h-[calc(100vh-60px)]"> {/* Adjusted height for potential topbar */}
      <div className="flex-grow relative flex flex-col">
        <div className="p-2 bg-gray-100 border-b border-gray-300 text-center">
            <h2 className="m-0 text-lg font-semibold">{canvasTitle}</h2>
        </div>
        
        <div className="flex-grow relative">
            {/* Excalidraw should render if not loading and initialData is present (which it always is as an object now) */}
            {!isLoading && initialData && (
                <Excalidraw
                    ref={excalidrawRef}
                    initialData={initialData}
                    key={canvasId} // Important for re-mounting if canvasId changes
                    onChange={handleCanvasChange} 
                    onMount={(api) => { 
                        // This is the crucial point where Excalidraw signals it's ready
                        setIsCanvasApiReady(true);
                        console.log("Excalidraw onMount: API is ready. Ref current:", excalidrawRef.current);
                    }}
                 />
            )}
        </div>
        
        <div className="absolute top-[calc(0.5rem+40px)] left-4 z-10 flex gap-2.5"> {/* Adjusted top positioning */}
          <button
            onClick={handleSaveCanvas}
            disabled={!isCanvasApiReady || isSaving || isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
                        ${(!isCanvasApiReady || isSaving || isLoading) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSaving ? "Saving..." : "Save Canvas"}
          </button>
          <button
            onClick={handleAskAI}
            disabled={!isCanvasApiReady || isAskingAI || isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
                        ${(!isCanvasApiReady || isAskingAI || isLoading) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isAskingAI ? "Asking AI..." : "Ask Slate AI"}
          </button>
        </div>
         {error && !isLoading && // Show operational errors only after initial loading phase
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-red-700 text-center p-2 bg-red-100 border border-red-400 rounded-md z-20 text-sm">
                Operation Error: {error}
            </div>
        }
      </div>

      {showAiSidebar && (
        <div className="w-[350px] border-l border-gray-300 p-4 overflow-y-auto bg-gray-50 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="mt-0 mb-0 text-lg font-semibold">AI Response</h3>
            <button onClick={() => setShowAiSidebar(false)} className="bg-transparent border-none text-2xl cursor-pointer p-1 leading-none hover:text-gray-700">&times;</button>
          </div>
          <div className="flex-grow mb-4 p-3 border border-gray-200 rounded-md bg-white overflow-y-auto text-sm leading-relaxed shadow-sm">
            <ReactMarkdown 
                components={{ 
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                        <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-2 text-xs" {...props}><code>{String(children).replace(/\n$/, '')}</code></pre>
                        ) : (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 text-xs" {...props}>{children}</code>
                        )
                    }
                }}
            >
                {aiResponse}
            </ReactMarkdown>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={handleSpeakAIResponse} 
                className="flex-1 px-3 py-2.5 text-sm font-medium cursor-pointer bg-gray-600 hover:bg-gray-700 text-white border-none rounded-md transition-colors">
                Speak
            </button>
            <button 
                onClick={handleCopyAIResponse} 
                className="flex-1 px-3 py-2.5 text-sm font-medium cursor-pointer bg-gray-600 hover:bg-gray-700 text-white border-none rounded-md transition-colors">
                Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
