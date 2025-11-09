import { Router } from 'express';
import type { RequestHandler } from 'express';

import { authRoutes } from './auth/auth.controller';
import { usersRoutes } from './users/users.controller';

const apiRouter = Router();

const healthHandler: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' });
};

apiRouter.get('/health', healthHandler);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);

export const apiRoutes = apiRouter;
