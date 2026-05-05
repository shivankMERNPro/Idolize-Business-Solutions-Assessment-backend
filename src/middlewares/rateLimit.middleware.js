import rateLimit from 'express-rate-limit';

import { rateLimitRules } from '../constants/rateLimit.js';

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    status: 429,
    message: 'Too many failed attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export function customRateLimiter(max, windowMins, options = {}) {
  if (max <= 0) {
    throw new Error('[customRateLimiter] max must be a positive integer');
  }

  if (windowMins <= 0) {
    throw new Error('[customRateLimiter] windowMins must be a positive number');
  }

  const windowMs = windowMins * 60 * 1000;

  return rateLimit({
    windowMs,
    max,
    message: {
      status: 429,
      message: `Rate limit exceeded: max ${max} requests per ${windowMins} minute${windowMins === 1 ? '' : 's'}. Please try again later.`,
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

export function applyCustomRateLimits(app) {
  for (const rule of rateLimitRules) {
    const { max, windowMins, options = {}, apiEndpoints } = rule;

    if (!max || max <= 0) {
      throw new Error(
        `[applyCustomRateLimits] Invalid 'max' (${max}) in rule: ${JSON.stringify(rule)}`,
      );
    }

    if (!windowMins || windowMins <= 0) {
      throw new Error(
        `[applyCustomRateLimits] Invalid 'windowMins' (${windowMins}) in rule: ${JSON.stringify(rule)}`,
      );
    }

    if (!Array.isArray(apiEndpoints) || apiEndpoints.length === 0) {
      throw new Error(
        `[applyCustomRateLimits] 'apiEndpoints' must be a non-empty array in rule: ${JSON.stringify(rule)}`,
      );
    }

    const limiter = customRateLimiter(max, windowMins, options);

    for (const endpoint of apiEndpoints) {
      const parts = endpoint.trim().split(/\s+/);

      if (parts.length !== 2) {
        throw new Error(
          `[applyCustomRateLimits] Invalid endpoint format "${endpoint}". Expected "METHOD /path" (e.g. "POST /api/student" or "* /api/student/:id").`,
        );
      }

      const [method, routePath] = parts;
      const httpMethod = method.toUpperCase();

      if (httpMethod === '*') {
        app.use(routePath, limiter);
        continue;
      }

      const appMethod = httpMethod.toLowerCase();

      if (typeof app[appMethod] !== 'function') {
        throw new Error(
          `[applyCustomRateLimits] Unknown HTTP method "${method}" in endpoint "${endpoint}".`,
        );
      }

      app[appMethod](routePath, limiter);
    }
  }
}
