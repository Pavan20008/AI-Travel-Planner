require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const { isValidApiKey } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is required in .env');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is required in .env');
  process.exit(1);
}

connectDB();

if (!isValidApiKey(process.env.GEMINI_API_KEY)) {
  console.warn('\n⚠️  GEMINI_API_KEY is missing or invalid.');
  console.warn('   Trip generation will use fallback data until a valid key is provided.');
  console.warn('   Get a free key: https://aistudio.google.com/apikey\n');
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Travel Planner API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
