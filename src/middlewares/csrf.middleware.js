import { doubleCsrf } from 'csrf-csrf';

import { env } from '../constants/env.js';

const isProd = env.nodeEnv === 'production';

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => env.csrfSecret,
  getSessionIdentifier: (req) => req.cookies?.['connect.sid'] ?? 'csrf-session',
  cookieName: isProd ? '__Host-x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    path: '/',
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

export const getCsrfTokenHandler = (req, res) => {
  const csrfToken = generateCsrfToken(req, res);

  res.status(200).json({
    success: true,
    csrfToken,
    message:
      'Send this token in the x-csrf-token header for all mutating requests (POST/PUT/PATCH/DELETE).',
  });
};

export const csrfProtection = (req, res, next) => {
  doubleCsrfProtection(req, res, (err) => {
    if (err) {
      res.status(403).json({
        success: false,
        code: 403,
        message: 'Invalid or missing CSRF token. Request blocked.',
      });
      return;
    }

    next();
  });
};
