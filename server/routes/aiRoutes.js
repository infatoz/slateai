const express = require('express');
const router = express.Router();
const { slateAskHandler } = require('../controllers/aiController');
const { slateTeacherHandler } = require('../controllers/aiController');
const { generateVoiceElevenLabs } = require('../controllers/voiceController');
const { verifyToken } = require("../middlewares/authMiddleware");



router.post('/slate-ask', verifyToken, slateAskHandler);
router.post('/slate-teacher', verifyToken, slateTeacherHandler);
router.post('/voice-elevenlabs', verifyToken, generateVoiceElevenLabs);


module.exports = router;
