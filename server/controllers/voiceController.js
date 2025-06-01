const axios = require('axios');

exports.generateVoiceElevenLabs = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) return res.status(400).json({ message: 'Text is required' });

    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ audio: base64Audio });

  } catch (err) {
    console.error('ElevenLabs voice error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Voice generation failed', error: err.message });
  }
};
