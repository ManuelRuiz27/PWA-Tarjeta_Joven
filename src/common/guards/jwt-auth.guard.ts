import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers['authorization'];

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
        message: 'Formato de token no válido',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      (request as any).user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado',
      });
    }
  }
}
