// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/analyticsController');

router.get('/dashboard', protect, getDashboardStats);

module.exports = router;


