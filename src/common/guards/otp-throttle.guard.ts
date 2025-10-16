import {
  CanActivate,
  ExecutionContext,
  Injectable,
  TooManyRequestsException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

interface AttemptWindow {
  timestamps: number[];
}

@Injectable()
export class OtpThrottleGuard implements CanActivate {
  private readonly attempts = new Map<string, AttemptWindow>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(private readonly configService: ConfigService) {
    this.limit = Number(this.configService.get<string>('OTP_THROTTLE_LIMIT') ?? '5');
    const windowSeconds = Number(
      this.configService.get<string>('OTP_THROTTLE_WINDOW_SECONDS') ?? '60',
    );
    this.windowMs = windowSeconds * 1000;
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
      throw new TooManyRequestsException({
        code: 'OTP_RATE_LIMIT',
        message: 'Demasiados intentos de envío. Inténtalo más tarde.',
      });
    }

    window.timestamps.push(now);
    this.attempts.set(ip, window);

    return true;
  }
}
