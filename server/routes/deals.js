const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // must be a function

router.get('/deals', auth, (req, res) => {
  res.send('Deals data');
});

module.exports = router;

