const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getDeals, createDeal } = require('../controllers/dealController');

router.get('/', protect, getDeals);
router.post('/', protect, createDeal);

module.exports = router;
