const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const mountRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const ApiResponse = require('./utils/ApiResponse');

// ── Create Express app ───────────────────────────────────────
const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP logging ─────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  ApiResponse.ok(res, 'SettleX API is running', {
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ── Mount all route groups ───────────────────────────────────
mountRoutes(app);

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  ApiResponse.notFound(res, 'Route not found');
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

module.exports = app;
