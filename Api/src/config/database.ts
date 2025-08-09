import mongoose from 'mongoose';
import { Logger } from '../modules/shared/utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      process.env.MONGO_URI || (process.env as any).MONGODB_URI || 'mongodb://localhost:27017/TalabatDB';

    // Skip connection if no valid MongoDB URL is provided (for testing)
    if (!mongoUrl || mongoUrl.includes('localhost')) {
      Logger.warn('MongoDB URL not configured or using localhost - skipping connection in serverless environment');
      return;
    }

    await mongoose.connect(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: true, // Enable buffering for serverless
      bufferMaxEntries: 0,
    });

    Logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      Logger.error(`MongoDB connection error: ${String(err)}`);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
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
    // Don't throw in serverless environment, just log the error
    Logger.warn('Continuing without database connection...');
  }
};
