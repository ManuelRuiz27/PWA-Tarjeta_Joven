import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.status ?? 500;
  const message = error.message ?? 'Internal server error';

  res.status(statusCode).json({
    message,
  });
};
