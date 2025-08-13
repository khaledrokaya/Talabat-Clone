import mongoose from 'mongoose';
import { Logger } from '../modules/shared/utils/logger';

// Global connection promise to prevent multiple connections in serverless
let cachedConnection: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      process.env.MONGO_URI || (process.env as any).MONGODB_URI || 'mongodb://localhost:27017/TalabatDB';

    Logger.info('Attempting to connect to MongoDB...');

    // Check if already connected
    if ((mongoose.connection as any).readyState === 1) {
      Logger.info('MongoDB already connected');
      return;
    }

    // Check if connection is in progress
    if ((mongoose.connection as any).readyState === 2) {
      Logger.info('MongoDB connection in progress, waiting...');
      // Wait for existing connection attempt
      if (cachedConnection) {
        await cachedConnection;
        return;
      }
    }

    // Optimize for serverless environments
    const connectionOptions = {
      maxPoolSize: 5, // Reduced pool size for serverless
      serverSelectionTimeoutMS: 15000, // Reduced timeout for faster feedback
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      bufferCommands: true, // Enable buffering for better reliability
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      heartbeatFrequencyMS: 10000, // Check connection every 10s
      retryWrites: true,
    };

    // Cache the connection promise to prevent multiple simultaneous connections
    if (!cachedConnection) {
      cachedConnection = mongoose.connect(mongoUrl, connectionOptions);
    }

    await cachedConnection;

    Logger.info(`MongoDB connected successfully: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      Logger.error(`MongoDB connection error: ${String(err)}`);
      cachedConnection = null; // Reset cache on error
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
      cachedConnection = null; // Reset cache on disconnect
    });

    mongoose.connection.on('connected', () => {
      Logger.info('MongoDB connection established');
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
    Logger.error(`Error connecting to MongoDB: ${String(error)}`);
    cachedConnection = null; // Reset cache on error

    // For specific connection errors, provide more context
    if (error instanceof Error) {
      if (error.message.includes('MongoParseError')) {
        Logger.error('MongoDB connection string parsing error - check MONGO_URI format');
      } else if (error.message.includes('MongoNetworkError')) {
        Logger.error('MongoDB network error - check database availability');
      }
    }

    throw error; // Re-throw to handle in middleware
  }
};
