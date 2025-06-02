import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SlateAI() {
  const { id } = useParams(); // this gets the `:id` from the URL
  const [canvas, setCanvas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCanvas = async () => {
      const token = localStorage.getItem("authUser")
        ? JSON.parse(localStorage.getItem("authUser")).accessToken
        : null;

      try {
        const res = await fetch(`http://localhost:5000/api/canvas/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error fetching canvas");

        setCanvas(data.canvas);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchCanvas();
  }, [id]);

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!canvas) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{canvas.title}</h1>
      <p className="mt-2 text-gray-600">{canvas.description}</p>
      <p className="mt-2 text-sm text-gray-400">
        Visibility: {canvas.isPublic ? "Public" : "Private"}
      </p>
      <div className="mt-4">
        <p className="text-md">
          <strong>Owner:</strong> {canvas.owner.fullName} ({canvas.owner.email})
        </p>
        {canvas.collaborators.length > 0 && (
          <>
            <h3 className="mt-2 font-semibold">Collaborators:</h3>
            <ul className="list-disc list-inside">
              {canvas.collaborators.map((c) => (
                <li key={c._id}>
                  {c.fullName} ({c.email})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
