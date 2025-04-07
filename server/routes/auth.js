// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users = []; // for testing; replace with DB in production

const SECRET = 'supersecretkey'; // Use env in real projects

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const userExists = users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
