import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import { env } from './constants/env.js';
import { logger } from './utils/logger.js';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { helmetMiddleware } from './middlewares/helmet.middleware.js';
import {
  rateLimiterMiddleware,
  applyCustomRateLimits,
} from './middlewares/rateLimit.middleware.js';
import {
  mongoSanitizeMiddleware,
  hppMiddleware,
} from './middlewares/sanitize.middleware.js';
import {
  csrfProtection,
  getCsrfTokenHandler,
} from './middlewares/csrf.middleware.js';

import parentRoutes from './app.js';
import connectDB from './configs/dbConnectionConfig.js';

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiterMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);
app.use(cookieParser());

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (req.path === '/api/csrf-token') {
    return next();
  }

  return csrfProtection(req, res, next);
});

app.get('/api/csrf-token', getCsrfTokenHandler);

applyCustomRateLimits(app);
app.use(parentRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Service is running' });
});

app.get('/api/mongodb/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    environment: env.nodeEnv,
    database: states[dbState] ?? 'Unknown',
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use((err, _req, res, _next) => {
  const isProd = env.nodeEnv === 'production';

  logger.error(`[GlobalError] ${err?.stack || err?.message || String(err)}`);

  const statusCode = typeof err?.status === 'number' ? err.status : 500;
  const safeMessage = isProd
    ? statusCode < 500
      ? err?.message
      : 'Internal Server Error'
    : err?.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: safeMessage,
    ...(isProd ? {} : { stack: err?.stack }),
  });
});

const server = app.listen(env.port, async () => {
  await connectDB();
  logger.success(
    `Server is running at http://localhost:${env.port} [${env.nodeEnv}]`,
  );
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err?.message || String(err)}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err?.message || String(err)}`);
  server.close(() => process.exit(1));
});
