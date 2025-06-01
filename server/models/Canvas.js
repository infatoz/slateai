const mongoose = require("mongoose");

const canvasSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    image: String, // Base64 or preview SVG image
    excalidrawData:{
      type: Object,
      default: {}, // Default to empty object if no data// Excalidraw JSON data
    }, // Full canvas state
    isPublic: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Canvas", canvasSchema);