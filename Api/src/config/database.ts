import mongoose from 'mongoose';
import { Logger } from '../modules/shared/utils/logger';

// Global connection promise to prevent multiple connections in serverless
let cachedConnection: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      process.env.MONGO_URI || (process.env as any).MONGODB_URI || 'mongodb://localhost:27017/TalabatDB';

    console.log('Attempting to connect to MongoDB...', mongoUrl.substring(0, 20) + '***');

    // Check if already connected
    if ((mongoose.connection as any).readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    // Check if connection is in progress
    if ((mongoose.connection as any).readyState === 2) {
      console.log('MongoDB connection in progress, waiting...');
      // Wait for existing connection attempt
      if (cachedConnection) {
        await cachedConnection;
        return;
      }
    }

    // Optimize for serverless environments
    const connectionOptions = {
      maxPoolSize: 5, // Reduced pool size for serverless
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      bufferCommands: false, // Disable buffering to fail fast
      bufferMaxEntries: 0,
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      heartbeatFrequencyMS: 10000, // Check connection every 10s
    };

    // Cache the connection promise to prevent multiple simultaneous connections
    if (!cachedConnection) {
      cachedConnection = mongoose.connect(mongoUrl, connectionOptions);
    }

    await cachedConnection;

    console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);
    Logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      Logger.error(`MongoDB connection error: ${String(err)}`);
      cachedConnection = null; // Reset cache on error
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      Logger.warn('MongoDB disconnected');
      cachedConnection = null; // Reset cache on disconnect
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    // Don't add SIGINT handler in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        Logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    Logger.error(`Error connecting to MongoDB: ${String(error)}`);
    cachedConnection = null; // Reset cache on error
    throw error; // Re-throw to handle in middleware
  }
};
