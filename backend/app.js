
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import materialRoutes from './routes/materialRoutes.js';

import notFound from './middleware/notFoundMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';
import sanitizeInput from './utils/sanitize.js';
import { clientOrigins } from './config/env.js';

export default function createApp() {
  const app = express();

  const isTest = process.env.NODE_ENV === 'test';
  const origins = clientOrigins();

  // Trust the deployment platform proxy.
  app.set('trust proxy', 1);

  // Security middleware.
  app.use(helmet());

  // CORS configuration.
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Request logging.
  if (!isTest) {
    app.use(
      morgan(
        process.env.NODE_ENV === 'production'
          ? 'combined'
          : 'dev'
      )
    );
  }

  // Request body parsing.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({
    extended: false,
    limit: '1mb'
  }));

  // Input sanitization.
  app.use(sanitizeInput);

  // Login and registration rate limiting.
  if (!isTest) {
    app.use(
      [
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/auth/login',
        '/api/auth/register'
      ],
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 30,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many login attempts, please try again later'
        }
      })
    );

    // General API rate limiting.
    app.use(
      '/api',
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many requests, please try again later'
        }
      })
    );
  }

  // API home route.
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'StudySphere API is running',
      version: '1.0.0'
    });
  });

  // Health check.
  const health = (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
      success: databaseConnected,
      status: databaseConnected ? 'healthy' : 'unhealthy',
      uptime: Math.round(process.uptime()),
      database: databaseConnected ? 'connected' : 'disconnected'
    });
  };

  app.get(['/api/health', '/api/v1/health'], health);

  // Register API routes.
  for (const base of ['/api/v1', '/api']) {
    app.use(`${base}/auth`, authRoutes);
    app.use(`${base}/courses`, courseRoutes);
    app.use(`${base}/students`, studentRoutes);
    app.use(`${base}/enrollments`, enrollmentRoutes);
    app.use(`${base}/notifications`, notificationRoutes);
    app.use(`${base}/messages`, messageRoutes);
    app.use(`${base}/materials`, materialRoutes);
  }

  // Handle unknown routes.
  app.use(notFound);

  // Global error handler.
  app.use(errorHandler);

  return app;
}
