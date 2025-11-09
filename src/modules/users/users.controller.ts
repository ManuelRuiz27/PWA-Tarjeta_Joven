import { Router } from 'express';
import type { RequestHandler } from 'express';

import { authenticateMiddleware } from '../../middleware/authenticate';
import { UsersService } from './users.service';

const usersRouter = Router();
const usersService = new UsersService();

usersRouter.use(authenticateMiddleware);

const listUsersHandler: RequestHandler = async (_req, res, next) => {
  try {
    const users = await usersService.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

usersRouter.get('/', listUsersHandler);

export const usersRoutes = usersRouter;
