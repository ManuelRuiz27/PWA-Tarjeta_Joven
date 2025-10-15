import { registerAs } from '@nestjs/config';

export interface AppConfig {
  env: string;
  port: number;
  swaggerPath: string;
  rateLimit: {
    max: number;
    timeWindow: string;
  };
}

export default registerAs<AppConfig>('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  swaggerPath: 'docs',
  rateLimit: {
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    timeWindow: process.env.RATE_LIMIT_WINDOW ?? '900000',
  },
}));
