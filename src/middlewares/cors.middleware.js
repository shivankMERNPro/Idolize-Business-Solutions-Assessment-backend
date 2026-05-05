import cors from 'cors';

import { env } from '../constants/env.js';
import { logger } from '../utils/logger.js';

const allowedOrigins = env.corsOrigin ? env.corsOrigin.split(',') : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      env.nodeEnv !== 'production' ||
      !origin ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
};

export const corsMiddleware = cors(corsOptions);
