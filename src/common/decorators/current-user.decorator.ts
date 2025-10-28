import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  sub: string;
  curp: string;
  [key: string]: unknown;
}

type FastifyRequestWithUser = FastifyRequest & {
  user?: AuthenticatedUser;
};

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest<FastifyRequestWithUser>();
    return request.user ?? null;
  },
);
