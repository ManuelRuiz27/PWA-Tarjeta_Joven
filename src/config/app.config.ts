import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export interface RateLimitConfig {
  max: number;
  timeWindowMs: number;
}

export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
}

export interface AppConfig {
  env: string;
  port: number;
  swaggerPath: string;
  logLevel: LogLevel;
  cors: CorsConfig;
  rateLimit: {
    global: RateLimitConfig;
    otp: RateLimitConfig;
  };
  limits: {
    json: number;
    multipart: {
      total: number;
      file: number;
    };
  };
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const parseCorsOrigin = (origin: string | undefined, env: string): string | string[] | boolean => {
  if (origin) {
    if (origin.trim() === '*') {
      return '*';
    }

    const items = origin
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) {
      return false;
    }

    return items.length === 1 ? items[0] : items;
  }

  return env === 'development' ? '*' : false;
};

const parseLogLevel = (value: string | undefined, env: string): LogLevel => {
  const normalized = value?.toLowerCase();
  const defaultLevel: LogLevel = env === 'production' ? 'log' : env === 'test' ? 'warn' : 'debug';

  if (!normalized) {
    return defaultLevel;
  }

  const aliases: Record<string, LogLevel> = {
    info: 'log',
    warning: 'warn',
  };

  if (normalized in aliases) {
    return aliases[normalized];
  }

  const allowedLevels: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];

  return allowedLevels.includes(normalized as LogLevel)
    ? (normalized as LogLevel)
    : defaultLevel;
};

export const buildAppConfig = (): AppConfig => {
  const env = process.env.NODE_ENV ?? 'development';

  const corsOrigin = parseCorsOrigin(process.env.CORS_ORIGIN, env);
  const corsCredentials = parseBoolean(
    process.env.CORS_CREDENTIALS,
    corsOrigin !== '*' && corsOrigin !== false,
  );

  const jsonLimit = parseNumber(process.env.JSON_BODY_LIMIT_BYTES, 1 * 1024 * 1024);
  const multipartTotal = parseNumber(
    process.env.MULTIPART_TOTAL_LIMIT_BYTES,
    10 * 1024 * 1024,
  );
  const multipartFile = parseNumber(process.env.MULTIPART_FILE_LIMIT_BYTES, 2 * 1024 * 1024);

  const rateLimitGlobalMax = parseNumber(process.env.RATE_LIMIT_GLOBAL_MAX, 100);
  const rateLimitGlobalWindowMs = parseNumber(
    process.env.RATE_LIMIT_GLOBAL_WINDOW_MS,
    15 * 60 * 1000,
  );
  const rateLimitOtpMax = parseNumber(process.env.RATE_LIMIT_OTP_MAX, 10);
  const rateLimitOtpWindowMs = parseNumber(
    process.env.RATE_LIMIT_OTP_WINDOW_MS,
    60 * 1000,
  );

  return {
    env,
    port: parseNumber(process.env.PORT, 8080),
    swaggerPath: 'docs',
    logLevel: parseLogLevel(process.env.LOG_LEVEL, env),
    cors: {
      origin: corsOrigin,
      credentials: corsCredentials,
    },
    rateLimit: {
      global: {
        max: rateLimitGlobalMax,
        timeWindowMs: rateLimitGlobalWindowMs,
      },
      otp: {
        max: rateLimitOtpMax,
        timeWindowMs: rateLimitOtpWindowMs,
      },
    },
    limits: {
      json: jsonLimit,
      multipart: {
        total: multipartTotal,
        file: multipartFile,
      },
    },
  };
};

export default registerAs<AppConfig>('app', buildAppConfig);
