const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleAIRequest = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for managing sales pipelines.' },
        { role: 'user', content: prompt },
      ],
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error('❌ AI error:', error);
    res.status(500).json({ message: 'AI processing failed.' });
  }
};

module.exports = { handleAIRequest };


