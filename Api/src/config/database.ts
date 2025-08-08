import mongoose from 'mongoose';
import { Logger } from '../modules/shared/utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      process.env.MONGO_URI || 'mongodb://localhost:27017/TalabatDB';

    await mongoose.connect(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    Logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      Logger.error(`MongoDB connection error: ${String(err)}`);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      Logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    Logger.error(`Error connecting to MongoDB: ${String(error)}`);
    throw error;
  }
};
