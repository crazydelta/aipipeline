const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
    getDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStage
  } = require('../controllers/dealController');

router.get('/', protect, getDeals);
router.post('/', protect, createDeal);
router.put('/:id', protect, updateDeal);        
router.delete('/:id', protect, deleteDeal);     
router.patch('/:id/stage', protect, updateDealStage);
module.exports = router;
