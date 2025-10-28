import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

type RefreshRequest = FastifyRequest<{
  Body: {
    refreshToken?: string;
  };
}> & {
  user?: AuthenticatedUser;
};

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RefreshRequest>();
    const token = request.body?.refreshToken;

    if (!token || token.trim().length === 0) {
      throw new BadRequestException({
        code: 'REFRESH_TOKEN_REQUIRED',
        message: 'El token de refresco es obligatorio',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'El token de refresco es invalido o ha expirado',
      });
    }
  }
}
