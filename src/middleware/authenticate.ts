import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { appConfig } from '../config/env';
import { HttpError } from '../core/http-error';
import type { AuthTokenPayload } from '../modules/auth/auth.types';

const getTokenFromHeader = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new HttpError(401, 'Authorization header is missing');
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError(401, 'Authorization header is malformed');
  }

  return token;
};

export const authenticateMiddleware: RequestHandler = (req, _res, next) => {
  try {
    const token = getTokenFromHeader(req.headers?.authorization);
    const payload = jwt.verify(token, appConfig.jwtSecret) as AuthTokenPayload;

    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    next(new HttpError(401, 'Invalid or expired token'));
  }
};
