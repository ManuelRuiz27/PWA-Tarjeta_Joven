import type { RequestHandler } from 'express';

export const credentialsMiddleware: RequestHandler = (_req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
};
