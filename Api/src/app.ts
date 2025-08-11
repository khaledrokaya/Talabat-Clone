import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';
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
    // Initialize database connection
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      console.log('Initializing database connection...');
      await this.connectToDatabase();
      console.log('Database initialization completed');
    } catch (error) {
      console.error('Database initialization failed:', error);
      Logger.error(`Database initialization failed: ${String(error)}`);
      // Don't prevent app from starting, but log the error
    }
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
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:4200',
      // Add your frontend Vercel URL here when you get it
    ].filter(Boolean); // Remove undefined values

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, Postman, etc.)
          if (!origin) return callback(null, true);

          // Check if origin is in allowed list
          if (allowedOrigins.some(allowedOrigin =>
            origin.startsWith(allowedOrigin || '') ||
            allowedOrigin === '*'
          )) {
            return callback(null, true);
          }

          // For development, allow any localhost
          if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
            return callback(null, true);
          }

          // Allow Vercel preview deployments
          if (origin.includes('vercel.app')) {
            return callback(null, true);
          }

          callback(new Error('Not allowed by CORS'));
        },
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
        verify: (req: any, res: any, buf: any) => {
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
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Welcome to Talabat API',
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Talabat API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Talabat API',
        version: '1.0.0',
        description: 'Food delivery platform API',
        documentation: '/swagger',
        endpoints: {
          auth: {
            login: 'POST /api/auth/login',
            register: 'POST /api/auth/register',
            logout: 'POST /api/auth/logout'
          },
          restaurants: {
            list: 'GET /api/restaurants',
            details: 'GET /api/restaurants/:id'
          },
          meals: {
            list: 'GET /api/meals',
            details: 'GET /api/meals/:id'
          },
          orders: {
            create: 'POST /api/orders',
            list: 'GET /api/orders',
            details: 'GET /api/orders/:id'
          }
        },
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });

    // API routes - add database check middleware
    this.app.use('/api', async (req, res, next) => {
      // Skip database check for health endpoints
      if (req.path === '/health' || req.path === '/' || req.path === '') {
        return next();
      }

      // Check if mongoose is connected
      try {
        const readyState = (mongoose.connection as any).readyState;
        console.log('Database connection state:', readyState, 'for path:', req.path);

        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        if (readyState === 1) {
          // Already connected, proceed
          return next();
        }

        if (readyState === 0) {
          // Try to reconnect if disconnected
          console.log('Database disconnected, attempting to reconnect...');
          try {
            // Set a timeout for the connection attempt
            const connectionPromise = connectDB();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Connection timeout')), 10000)
            );

            await Promise.race([connectionPromise, timeoutPromise]);

            // Check again after connection attempt
            const newState = (mongoose.connection as any).readyState;
            if (newState === 1) {
              console.log('Reconnection successful, proceeding with request');
              return next();
            } else {
              throw new Error(`Connection failed, state: ${newState}`);
            }
          } catch (reconnectError) {
            console.error('Reconnection failed:', reconnectError);
            return res.status(503).json({
              success: false,
              message: 'Database connection failed. The service is temporarily unavailable.',
              status: 'service_unavailable',
              debug: {
                connectionState: 'disconnected',
                mongoUri: process.env.MONGO_URI ? 'configured' : 'not configured',
                reconnectAttempted: true,
                error: String(reconnectError)
              }
            });
          }
        }

        if (readyState === 2) {
          // Wait shorter time for connecting state
          console.log('Database connecting, waiting briefly...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          const newState = (mongoose.connection as any).readyState;
          if (newState === 1) {
            return next();
          }
          return res.status(503).json({
            success: false,
            message: 'Database connection in progress. Please try again in a moment.',
            status: 'connecting',
            debug: {
              connectionState: 'connecting',
              waitTime: '2000ms'
            }
          });
        }

      } catch (error) {
        console.error('Database check error:', error);
        return res.status(503).json({
          success: false,
          message: 'Database connection check failed.',
          status: 'service_unavailable',
          error: String(error)
        });
      }

      next();
    });

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
    // Only enable Swagger in development or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && !(process.env as any).ENABLE_SWAGGER) {
      // In production, provide a simple API documentation endpoint
      this.app.get('/swagger', (req, res) => {
        res.json({
          message: 'API Documentation',
          endpoints: {
            health: '/health',
            auth: '/api/auth/*',
            admin: '/api/admin/*',
            delivery: '/api/delivery/*',
            customer: '/api/customer/*',
            orders: '/api/orders/*',
            meals: '/api/meals/*',
            restaurants: '/api/restaurants/*'
          },
          note: 'Full Swagger UI is disabled in production for performance. Set ENABLE_SWAGGER=true to enable.'
        });
      });
      return;
    }

    const swaggerOptions = {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Talabat API Documentation',
    };

    try {
      this.app.use(
        '/swagger',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerOptions),
      );
    } catch (error) {
      Logger.error(`Swagger initialization failed: ${String(error)}`);
      // Fallback endpoint if Swagger fails
      this.app.get('/swagger', (req, res) => {
        res.json({
          message: 'API Documentation (Swagger UI failed to load)',
          error: 'Swagger UI encountered an error in serverless environment',
          endpoints: {
            health: '/health',
            auth: '/api/auth/*',
            admin: '/api/admin/*',
            delivery: '/api/delivery/*',
            customer: '/api/customer/*',
            orders: '/api/orders/*',
            meals: '/api/meals/*',
            restaurants: '/api/restaurants/*'
          }
        });
      });
    }
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
      // Don't exit in serverless environments - let the app continue without DB
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      } else {
        Logger.warn('Continuing without database connection in production...');
      }
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
