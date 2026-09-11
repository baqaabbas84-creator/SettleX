/**
 * SettleX Backend — Entry Point
 *
 * Loads environment variables, connects to MongoDB,
 * and starts the Express HTTP server.
 */

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');

const start = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP server
  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║           SettleX Backend API                 ║
║  Trust Every Deal. Settle Every Milestone.    ║
╠═══════════════════════════════════════════════╣
║  Environment : ${config.nodeEnv.padEnd(30)}║
║  Port        : ${String(config.port).padEnd(30)}║
║  Health      : http://localhost:${config.port}/api/health    ║
╚═══════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
  });
};

start();
