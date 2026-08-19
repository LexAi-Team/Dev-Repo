import logger from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    errorCode,
    path: req?.path,
    method: req?.method,
    ip: req?.ip
  });

  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
