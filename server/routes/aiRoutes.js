// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateDealInsights } = require('../services2/aiService');
const Deal = require('../models/Deal');

router.post('/assistant', async (req, res) => {
    try {
      const { prompt } = req.body;
  
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }
  
      // Optional: fetch deals or use dummy data
      const deals = await Deal.find(); // or [] if you want empty
      const insights = await generateDealInsights(deals, prompt);
  
      res.json({ insights });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to generate AI insights' });
    }
  });
  

module.exports = router;





