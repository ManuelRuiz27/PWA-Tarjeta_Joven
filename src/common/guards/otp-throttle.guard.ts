import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { AppConfig } from '../../config/app.config';

interface AttemptWindow {
  timestamps: number[];
}

@Injectable()
export class OtpThrottleGuard implements CanActivate {
  private readonly attempts = new Map<string, AttemptWindow>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(private readonly configService: ConfigService) {
    const appConfig = this.configService.get<AppConfig>('app');
    this.limit = appConfig?.rateLimit.otp.max ?? 10;
    this.windowMs = appConfig?.rateLimit.otp.timeWindowMs ?? 60_000;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const forwarded = request.headers['x-forwarded-for'];
    const candidate = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = request.ip ?? candidate ?? 'unknown';
    const now = Date.now();

    const window = this.attempts.get(ip) ?? { timestamps: [] };
    window.timestamps = window.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    if (window.timestamps.length >= this.limit) {
      this.attempts.set(ip, window);
      throw new HttpException(
        {
          code: 'OTP_RATE_LIMIT',
          message: 'Demasiados intentos de envio. Intentalo mas tarde.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    window.timestamps.push(now);
    this.attempts.set(ip, window);

    return true;
  }
}
