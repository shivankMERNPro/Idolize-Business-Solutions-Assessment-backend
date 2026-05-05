import { STATUS_MESSAGE } from '../constants/httpStatus.js';

export const sendResponse = (res, statusCode, payload) => {
  if (payload && typeof payload === 'object' && 'code' in payload) {
    const success =
      typeof payload.success === 'boolean'
        ? payload.success
        : statusCode >= 200 && statusCode < 300;

    const message =
      payload.message ||
      STATUS_MESSAGE[statusCode] ||
      (success ? 'Success' : 'Error');

    const response = {
      success,
      code: statusCode,
      message,
      error: payload.error,
      data: payload.data,
      errors: payload.errors,
    };

    return res.status(statusCode).json(response);
  }

  const isSuccess = statusCode >= 200 && statusCode < 300;
  const statusMessage =
    STATUS_MESSAGE[statusCode] || (isSuccess ? 'Success' : 'Error');

  const response = {
    success: isSuccess,
    code: statusCode,
    message: typeof payload === 'string' ? payload : statusMessage,
    error: !isSuccess && typeof payload === 'string' ? payload : undefined,
    data: isSuccess && typeof payload !== 'string' ? payload : undefined,
  };

  return res.status(statusCode).json(response);
};
