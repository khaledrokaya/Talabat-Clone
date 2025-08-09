import mongoose from 'mongoose';
import { Logger } from '../modules/shared/utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      process.env.MONGO_URI || (process.env as any).MONGODB_URI || 'mongodb://localhost:27017/TalabatDB';

    console.log('Attempting to connect to MongoDB...', mongoUrl.substring(0, 20) + '***');

    // Don't skip connection for localhost anymore, let it try and fail gracefully
    await mongoose.connect(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: true, // Enable buffering for serverless
      bufferMaxEntries: 0,
    });

    console.log(`MongoDB connected successfully: ${mongoose.connection.host}`);
    Logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      Logger.error(`MongoDB connection error: ${String(err)}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
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
    console.error('Error connecting to MongoDB:', error);
    Logger.error(`Error connecting to MongoDB: ${String(error)}`);
    // Don't throw in serverless environment, just log the error
    Logger.warn('Continuing without database connection...');
  }
};
