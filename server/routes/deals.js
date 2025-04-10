// routes/deals.js
const express = require('express');
const router = express.Router();
const { createDeal } = require('../controllers/dealController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createDeal); // ✅ PROTECT this route

module.exports = router;