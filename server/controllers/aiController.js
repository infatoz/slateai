// controllers/aiController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
try {
  genAI = new GoogleGenerativeAI(apiKey);
} catch (err) {
  console.error("Failed to initialize Gemini:", err.message);
}

const excalidrawSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["excalidraw"] },
    version: { type: "number" },
    source: { type: "string" },
    elements: { type: "array", items: { type: "object" } },
    appState: { type: "object" },
  },
  required: ["type", "version", "elements", "appState"],
};

exports.askSlate = async (req, res) => {
  try {
    const { svgBase64 } = req.body;

    if (!svgBase64) {
      return res.status(400).json({ message: "Missing svgBase64 in request body." });
    }

    // Remove prefix & decode
    const base64 = svgBase64.replace(/^data:image\/svg\+xml;base64,/, "");
    const svgText = Buffer.from(base64, "base64").toString("utf-8");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI assistant embedded in a whiteboard tool. The user has drawn something using a digital canvas, and the following is the SVG representation of that drawing.

Your task is to:
- Understand what the user might have drawn.
- Describe it briefly in simple terms.
- If it's a chart, diagram, or flow, explain the structure.
- Suggest possible improvements if applicable.

SVG content:
${svgText}
`;

    const result = await model.generateContent([ { text: prompt } ]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ message: "AI response generated.", result: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      message: "AI processing failed.",
      error: err.message,
      stack: err.stack,
    });
  }
};
