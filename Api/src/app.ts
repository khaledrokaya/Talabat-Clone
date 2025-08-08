import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import { connectDB } from './config/database';
import { initializeApp } from './config/startup';
import { errorHandler } from './modules/shared/middlewares/error.middleware';
import { Logger } from './modules/shared/utils/logger';

// Import routes
import authRoutes from './modules/auth/routes';
import adminRoutes from './modules/admin/routes';
import deliveryRoutes from './modules/delivery/routes';
import customerRoutes from './modules/customer/routes';
import orderRoutes from './modules/order/routes';
import mealRoutes from './modules/meal/routes';
import restaurantPublicRoutes from './modules/restaurant/routes/public.routes';
import restaurantUserRoutes from './modules/restaurant/routes/restaurant-user.routes';

// Load environment variables
dotenv.config();

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
    void this.connectToDatabase();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:4200',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }),
    );


    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(
      express.json({
        limit: '10mb',
        verify: (req: any, res: any, buf: Buffer) => {
          try {
            JSON.parse(buf.toString());
          } catch {
            res.status(400).json({
              success: false,
              message: 'Invalid JSON format',
            });
            return;
          }
        },
      }),
    );
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: '10mb',
      }),
    );

    // Cookie parsing middleware
    this.app.use(cookieParser());

    // Logging middleware
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(
        morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'),
      );
    }
    console.log(process.env.JWT_SECRET);
    console.log(process.env.NODE_ENV);

    // Request timeout middleware
    this.app.use((req, res, next) => {
      req.setTimeout(30000, () => {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
        });
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Talabat API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/delivery', deliveryRoutes);
    this.app.use('/api/customer', customerRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/meals', mealRoutes);
    this.app.use('/api/restaurants', restaurantPublicRoutes);
    this.app.use('/api/user/restaurants', restaurantUserRoutes);

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`,
        availableEndpoints: [
          '/api/auth',
          '/api/admin',
          '/api/restaurants',
          '/api/meals',
          '/api/delivery',
          '/api/customer',
          '/api/orders',
        ],
      });
    });

    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        hint: 'Try accessing /api/* endpoints or check /swagger for documentation',
      });
    });
  }

  private initializeSwagger(): void {
    const swaggerOptions = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Talabat API Documentation',
    };

    this.app.use(
      '/swagger',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerOptions),
    );
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await connectDB();
      Logger.success('Database connected successfully');
      await initializeApp();
    } catch (error) {
      Logger.error(`Database connection failed: ${error}`);
      process.exit(1);
    }
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      Logger.server(`Server running on port ${port}`);
      Logger.info(`API Documentation: http://localhost:${port}/swagger`);
      Logger.info(`Health Check: http://localhost:${port}/health`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

export default App;

const startServer = async (): Promise<void> => {
  try {
    const app = new App();
    const PORT = parseInt(process.env.PORT || '5000', 10);

    process.on('SIGTERM', () => {
      Logger.warn('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      Logger.warn('SIGINT received, shutting down gracefully');
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, _promise) => {
      Logger.error(`Unhandled Rejection: ${String(reason)}`);
      process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      Logger.error(`Uncaught Exception: ${String(error)}`);
      process.exit(1);
    });

    app.listen(PORT);
  } catch (error) {
    Logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}
