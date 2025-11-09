import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

import { appConfig } from '../../config/env';
import { prisma } from '../../database/prismaClient';
import { HttpError } from '../../core/http-error';
import { comparePassword, hashPassword } from '../shared/password.service';
import type { AuthTokenPayload, AuthTokens } from './auth.types';

const ACCESS_TOKEN_EXPIRATION = '1h';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  private generateAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, appConfig.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  private createRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  }

  async register(email: string, password: string): Promise<AuthTokenPayload> {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new HttpError(409, 'User already exists');
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

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const payload: AuthTokenPayload = { userId: user.id, email: user.email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.createRefreshToken();
    const tokenHash = this.hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new HttpError(400, 'Refresh token is invalid');
    }

    if (storedToken.revoked) {
      throw new HttpError(400, 'Refresh token has already been revoked');
    }

    if (storedToken.expiresAt <= new Date()) {
      await prisma.refreshToken.update({
        where: { tokenHash },
        data: { revoked: true },
      });
      throw new HttpError(400, 'Refresh token has expired');
    }

    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
}
