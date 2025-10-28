import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

type FastifyRequestWithUser = FastifyRequest & {
  user?: AuthenticatedUser;
};

@Injectable()
export class AuthenticateTokenMiddleware implements NestMiddleware {
  private readonly jwtService: JwtService;

  constructor(private readonly configService: ConfigService) {
    this.jwtService = new JwtService({
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async use(
    req: FastifyRequestWithUser,
    _res: FastifyReply,
    next: (error?: unknown) => void,
  ): Promise<void> {
    const authHeader = req.headers['authorization'];

    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token no encontrado',
      });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Formato de token no valido',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthenticatedUser>(token);
      req.user = payload;
      next();
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token invalido o expirado',
      });
    }
  }
}
