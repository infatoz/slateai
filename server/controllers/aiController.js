const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// SLATE ASK: Canvas (svg or json) → prompt Gemini → structured response
exports.slateAskHandler = async (req, res) => {
  try {
    const { excalidrawData, prompt } = req.body;

    if (!excalidrawData || !prompt) {
      return res.status(400).json({ message: 'Excalidraw data and prompt are required' });
    }

    // Optional: If excalidrawData is base64 SVG, extract data
    // const svgBuffer = Buffer.from(excalidrawData, 'base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = `
You are a helpful diagram interpreter. Given this Excalidraw JSON or description, analyze the content and reply with:
- A step-by-step explanation of the diagram
- A new enhanced version in Excalidraw format (if needed)
- Provide an outline suitable for a teacher to explain this visually

Input Diagram:
${JSON.stringify(excalidrawData)}

User prompt:
${prompt}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();

    res.json({ response }); // You can also parse and extract specific parts
  } catch (err) {
    console.error('Slate Ask error:', err);
    res.status(500).json({ message: 'Gemini AI error', error: err.message });
  }
};

exports.slateTeacherHandler = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = `
You are an AI teacher helping students understand complex concepts with step-by-step breakdowns and visual diagrams.

When given a question, you must respond with:
1. A short title of the topic.
2. A step-by-step explanation.
3. An Excalidraw-compatible JSON diagram (elements + appState) that helps illustrate the answer.

Output format (JSON string):
{
  "title": "Topic Title",
  "steps": ["Step 1...", "Step 2...", "..."],
  "diagram": {
    "elements": [...],
    "appState": {...}
  }
}

Question: ${question}
`;

    const result = await model.generateContent(fullPrompt);
    const text = await result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ message: 'Failed to parse AI response', raw: text });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Slate Teacher error:', err);
    res.status(500).json({ message: 'Gemini AI error', error: err.message });
  }
};

