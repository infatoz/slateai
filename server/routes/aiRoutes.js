const express = require("express");
const router = express.Router();
const { askSlate } = require("../controllers/aiController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/ask", verifyToken, askSlate);

module.exports = router;
