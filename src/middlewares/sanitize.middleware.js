import { sanitize, has } from 'express-mongo-sanitize';
import hpp from 'hpp';

import { logger } from '../utils/logger.js';

export const mongoSanitizeMiddleware = (req, _res, next) => {
  if (req.body && has(req.body)) {
    logger.warn(
      `[Security] MongoDB injection attempt in body - IP: ${req.ip} URL: ${req.originalUrl}`,
    );
    req.body = sanitize(req.body);
  }

  if (req.params && has(req.params)) {
    logger.warn(
      `[Security] MongoDB injection attempt in params - IP: ${req.ip} URL: ${req.originalUrl}`,
    );
    req.params = sanitize(req.params);
  }

  if (req.query && has(req.query)) {
    logger.warn(
      `[Security] MongoDB injection attempt in query - IP: ${req.ip} URL: ${req.originalUrl}`,
    );
    const sanitized = sanitize({ ...req.query });
    Object.assign(req.query, sanitized);
  }

  next();
};

export const hppMiddleware = hpp({
  whitelist: ['fields', 'sort', 'populate'],
});
