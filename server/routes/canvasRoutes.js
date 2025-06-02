const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const canvasCtrl = require("../controllers/canvasController");

router.post("/create", auth.verifyToken, canvasCtrl.createCanvas);
router.get("/my", auth.verifyToken, canvasCtrl.getMyCanvases);
router.get("/:id", auth.verifyToken, canvasCtrl.getCanvasById);
router.put("/:id", auth.verifyToken, canvasCtrl.updateCanvas);
router.put("/:id/state", auth.verifyToken, canvasCtrl.updateCanvasDrawingData);
router.delete("/:id", auth.verifyToken, canvasCtrl.deleteCanvas);
router.post("/:id/collaborators", auth.verifyToken, canvasCtrl.addCollaborator);

module.exports = router;