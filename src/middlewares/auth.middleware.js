import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../constants/env.js';
import { logger } from '../utils/logger.js';

const revokedTokens = new Set();

export function signToken(payload) {
  return jwt.sign({ ...payload, jti: uuidv4() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

export function revokeToken(jti) {
  revokedTokens.add(jti);
  logger.info(`[Auth] Token revoked - jti: ${jti}`);
}

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Authorization header missing or malformed. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      code: 401,
      message: 'Malformed authorization header. Expected: Bearer <token>',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    });

    if (revokedTokens.has(decoded.jti)) {
      logger.warn(
        `[Auth] Replay attack blocked - jti: ${decoded.jti} IP: ${req.ip}`,
      );
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Token has been revoked. Please log in again.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Token has expired. Please log in again.',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Invalid token. Access denied.',
      });
      return;
    }

    logger.error(`[Auth] Unexpected JWT verification error: ${String(error)}`);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal server error during authentication.',
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 401,
        message: 'Not authenticated.',
      });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      logger.warn(
        `[Auth] Unauthorized - user: ${req.user.sub} role: ${req.user.role} required: [${allowedRoles.join(', ')}] IP: ${req.ip}`,
      );
      res.status(403).json({
        success: false,
        code: 403,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};
