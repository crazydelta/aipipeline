// controllers/aiController.js
const cohere = require('cohere-ai');
cohere.init(process.env.COHERE_API_KEY); // Make sure you have this in your .env

exports.askCohere = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

  try {
    const response = await cohere.generate({
      model: 'command-r-plus', // Or 'command-light', 'command-xlarge-nightly'
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.body.generations[0]?.text.trim();
    res.json({ reply });
  } catch (err) {
    console.error('Cohere error:', err);
    res.status(500).json({ message: 'Failed to get response from Cohere' });
  }
};
