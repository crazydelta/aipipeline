// server/routes/ai.js
const express = require('express');
const router = express.Router();

// Example test route
router.get('/', (req, res) => {
  res.json({ message: 'AI endpoint is working!' });
});

module.exports = router;
