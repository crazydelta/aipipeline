const express = require('express');
const router = express.Router();
const { handleAIRequest } = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware'); // optional: only if using JWT auth

router.post('/ask', protect, handleAIRequest); // use 'protect' if route needs auth
// Or if testing without auth, you can just do:
// router.post('/ask', handleAIRequest);

module.exports = router;




