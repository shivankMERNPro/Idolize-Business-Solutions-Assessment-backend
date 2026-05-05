import morgan from 'morgan';

import { env } from '../constants/env.js';
import { logger } from '../utils/logger.js';

const stream = {
  write: (message) => logger.info(message.trim()),
};

const format =
  env.nodeEnv === 'production'
    ? 'combined'
    : ':method :url :status :response-time ms - :res[content-length] - :remote-addr';

export const requestLogger = morgan(format, { stream });
