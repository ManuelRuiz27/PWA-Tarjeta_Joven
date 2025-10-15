import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  sub: string;
  curp: string;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return (request as any).user ?? null;
  },
);
