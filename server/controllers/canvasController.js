const Canvas = require("../models/Canvas");
const User = require("../models/User");

exports.createCanvas = async (req, res) => {
  const { title, description, isPublic } = req.body;
  try {
    const canvas = await Canvas.create({
      title,
      description,
      isPublic,
      owner: req.user.id,
      collaborators: [],
      image: "", // Will be updated after canvas draw
      excalidrawData: {},
    });
    res.status(201).json({ message: "Canvas created", canvas });
  } catch (err) {
    res.status(500).json({ message: "Failed to create canvas", error: err });
  }
};

  exports.getCanvasById = async (req, res) => {
    try {
      const canvas = await Canvas.findById(req.params.id)
        .populate("owner", "fullName email")
        .populate("collaborators", "fullName email");

      if (!canvas) return res.status(404).json({ message: "Canvas not found" });

      if (!canvas.isPublic && ![canvas.owner._id.toString(), ...canvas.collaborators.map(c => c._id.toString())].includes(req.user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ canvas });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch canvas" });
    }
  };

exports.updateCanvas = async (req, res) => {
  const { title, description, isPublic, image, excalidrawData } = req.body;
  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) return res.status(404).json({ message: "Canvas not found" });
    if (canvas.owner.toString() !== req.user.id && !canvas.collaborators.includes(req.user.id))
      return res.status(403).json({ message: "Not authorized" });

    if (title !== undefined) canvas.title = title;
    if (description !== undefined) canvas.description = description;
    if (isPublic !== undefined) canvas.isPublic = isPublic;
    if (image !== undefined) canvas.image = image;
    if (excalidrawData !== undefined) canvas.excalidrawData = excalidrawData;

    await canvas.save();
    res.json({ message: "Canvas updated", canvas });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
};

exports.deleteCanvas = async (req, res) => {
  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) return res.status(404).json({ message: "Canvas not found" });
    if (canvas.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can delete" });

    await canvas.deleteOne();
    res.json({ message: "Canvas deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.addCollaborator = async (req, res) => {
  const { emails } = req.body; // Array of email strings

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: "Provide an array of email addresses" });
  }

  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) return res.status(404).json({ message: "Canvas not found" });

    if (canvas.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only owner can add collaborators" });

    const validUsers = await User.find({ email: { $in: emails } });

    const userIdsToAdd = validUsers
      .filter(
        (user) =>
          user._id.toString() !== req.user.id && // exclude owner
          !canvas.collaborators.includes(user._id) // exclude existing collaborators
      )
      .map((user) => user._id);

    if (userIdsToAdd.length === 0) {
      return res.status(400).json({ message: "No valid new collaborators found" });
    }

    canvas.collaborators.push(...userIdsToAdd);
    await canvas.save();

    res.json({
      message: "Collaborators added",
      added: validUsers.map((u) => u.email),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add collaborators" });
  }
};

exports.updateCanvasDrawingData = async (req, res) => {
  const { elements, appState, image } = req.body;

  if (!Array.isArray(elements)) {
    return res.status(400).json({ message: "Canvas elements must be an array" });
  }

  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) return res.status(404).json({ message: "Canvas not found" });

    const userId = req.user.id;
    const isOwner = canvas.owner.toString() === userId;
    const isCollaborator = canvas.collaborators.some(
      id => id.toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Access denied" });
    }

    canvas.excalidrawData = {
      elements,
      appState: appState || canvas.excalidrawData.appState,
    };
    if (image) canvas.image = image;

    await canvas.save();

    res.json({ message: "Canvas drawing updated", canvasId: canvas._id });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error while updating canvas" });
  }
};

exports.getMyCanvases = async (req, res) => {
  try {
    const userId = req.user.id;

    const canvases = await Canvas.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    })
      .populate("owner", "fullName email")
      .populate("collaborators", "fullName email")
      .sort({ updatedAt: -1 });

    res.json({ canvases });
  } catch (err) {
    console.error("Error fetching user's canvases:", err);
    res.status(500).json({ message: "Server error while fetching canvases" });
  }
};