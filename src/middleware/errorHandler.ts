import type { ErrorRequestHandler } from 'express';
import { AppError } from '../shared/errors';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err instanceof AppError ? err.message : 'An unexpected error occurred.';

  const payload: Record<string, unknown> = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (err instanceof AppError && err.details) {
    payload.error = {
      ...payload.error,
      fields: err.details,
    };
  }

  if (statusCode >= 500) {
    res.status(500).json(payload);
    return;
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
