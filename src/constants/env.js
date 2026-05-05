import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'CSRF_SECRET', 'MONGO_URI'];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `[ENV] Missing required environment variables: ${missing.join(', ')}. ` +
      'Please check your .env file.',
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8080,
  mongoUri: process.env.MONGO_URI || '',
  mongoDbName: process.env.MONGO_DB_NAME || '',
  mongoMaxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 0,
  mongoMinPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 0,
  mongoConnectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 0,
  mongoSocketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 0,
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  csrfSecret: process.env.CSRF_SECRET || '',
  corsOrigin: process.env.CORS_ORIGIN || '',
};
