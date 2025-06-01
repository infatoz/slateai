// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv');
const xssSanitize = require('./middlewares/xssSanitize');
const mongoSanitize = require('./middlewares/mongoSanitize');

// Routes
const authRoutes = require('./routes/authRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(xssSanitize);
app.use(mongoSanitize);

app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Slate AI Backend is running.');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

module.exports = app;
