import jwt from 'jsonwebtoken';

import { appConfig } from '../../config/env';
import { prisma } from '../../database/prismaClient';
import { comparePassword, hashPassword } from '../shared/password.service';

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

export class AuthService {
  async register(email: string, password: string): Promise<AuthTokenPayload> {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { userId: user.id, email: user.email };
  }

  async login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return jwt.sign({ userId: user.id, email: user.email }, appConfig.jwtSecret, {
      expiresIn: '1h',
    });
  }
}
