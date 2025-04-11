const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const authRoutes = require('./routes/auth');
const dealRoutes = require('./routes/dealRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes'); // ✅ only this one now

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://your-frontend.vercel.app', // replace with actual Vercel URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you're using cookies/sessions
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('👉 Using DB:', mongoose.connection.name); // Add this
})
.catch(err => console.error('❌ MongoDB connection failed:', err));

app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes); // ✅ AI route

// Optional error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
