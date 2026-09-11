const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Reads MONGODB_URI from environment variables.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL — MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting reconnect…');
  });
};

module.exports = connectDB;
