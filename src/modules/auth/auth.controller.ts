import { Router } from 'express';
import type { RequestHandler } from 'express';

import { AuthService } from './auth.service';

const authRouter = Router();
const authService = new AuthService();

const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const payload = await authService.register(email, password);

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const token = await authService.login(email, password);

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);

export const authRoutes = authRouter;
