/**
 * Central environment configuration.
 * All env lookups happen here so the rest of the codebase
 * imports a plain object instead of touching process.env directly.
 */
module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/settlex',

  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_ME',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-2.0-flash',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
