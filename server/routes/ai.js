// routes/airoutes.js
const express = require('express');
const router = express.Router();
const { askCohere } = require('../controllers/aiController');
const protect = require('../middleware/protect');

router.post('/cohere', protect, askCohere);

module.exports = router;

