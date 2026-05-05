import { ZodError } from 'zod';

import { env } from '../constants/env.js';
import { logger } from '../utils/logger.js';

function prepareValidationData(req) {
  const method = req.method.toUpperCase();

  switch (method) {
    case 'GET':
      return req.query;
    case 'POST':
      return req.body;
    case 'PUT':
    case 'PATCH':
      return { ...req.body, ...req.params };
    case 'DELETE':
      return req.params;
    default:
      return {};
  }
}

function isErrorWithMessage(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const dataToValidate = prepareValidationData(req);
      const validatedData = await schema.parseAsync(dataToValidate);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        if (env.nodeEnv === 'development') {
          logger.error(
            `Validation Error: ${JSON.stringify(formattedErrors, null, 2)}`,
          );
        }

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }

      if (isErrorWithMessage(error)) {
        logger.error(`Validation Middleware Error: ${error.message}`);
        res.status(500).json({
          success: false,
          message: error.message || 'Internal server error',
        });
        return;
      }

      logger.error(
        `Unexpected non-standard error in validation middleware: ${JSON.stringify(error)}`,
      );
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during validation.',
      });
    }
  };
};
