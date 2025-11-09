import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';

import { corsMiddleware } from './config/cors';
import { credentialsMiddleware } from './middleware/credentials';
import { apiRoutes } from './modules';
import { errorHandler } from './core/error-handler';

const upload = multer();

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(upload.none());
  app.use(credentialsMiddleware);
  app.use(corsMiddleware);

  app.use('/api', apiRoutes);

  app.use(errorHandler);

  return app;
};
