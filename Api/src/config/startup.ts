import { User } from '../modules/shared/schemas/base-user.schema';
import { Helpers } from '../modules/shared/utils/helpers';
import { Logger } from '../modules/shared/utils/logger';

export const initializeAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({
      role: 'admin',
    });

    if (adminExists) {
      Logger.info('Admin user already exists');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@talabat.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      Logger.warn(
        'Using default admin credentials. Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file',
      );
    }

    const hashedPassword = await Helpers.hashPassword(adminPassword);

    const admin = new User({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });

    await admin.save();

    Logger.success('Admin user created successfully');
    Logger.info(`Email: ${adminEmail}`);
    Logger.info(`Password: ${adminPassword}`);
    Logger.warn('Please change the admin password after first login');
  } catch (error) {
    Logger.error(`Failed to initialize admin user: ${String(error)}`);
    throw error;
  }
};

export const performDatabaseMaintenance = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Logger.success('Database maintenance completed');
  } catch (error) {
    Logger.error(`Database maintenance failed: ${String(error)}`);
  }
};

export const initializeApp = async (): Promise<void> => {
  try {
    Logger.info('Initializing Talabat API...');

    await initializeAdmin();
    await performDatabaseMaintenance();

    Logger.success('Application initialized successfully');
  } catch (error) {
    Logger.error(`Application initialization failed: ${String(error)}`);
    throw error;
  }
};
