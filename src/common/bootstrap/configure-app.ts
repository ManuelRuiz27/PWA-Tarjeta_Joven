import {
  HttpStatus,
  LoggerService,
  PayloadTooLargeException,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { FastifyRequest } from 'fastify';
import { AppConfig } from '../../config/app.config';
import { HttpErrorFilter } from '../filters/http-exception.filter';

export interface ConfigureAppOptions {
  logger?: LoggerService;
  captureException?: (exception: unknown, context?: Record<string, unknown>) => void;
}

const normalizeHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const extractClientIp = (request: FastifyRequest): string => {
  const forwarded = normalizeHeaderValue(request.headers['x-forwarded-for']);
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || request.ip;
  }

  return request.ip || 'unknown';
};

const matchesOtpSendRoute = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return normalized.endsWith('/auth/otp/send');
};

const isMultipartRequest = (request: FastifyRequest): boolean => {
  const contentType = normalizeHeaderValue(request.headers['content-type']);
  return Boolean(contentType?.startsWith('multipart/form-data'));
};

const calculateMultipartBodySize = (
  payload: unknown,
  visited: WeakSet<object> = new WeakSet(),
): number => {
  if (!payload) {
    return 0;
  }

  if (Buffer.isBuffer(payload)) {
    return payload.length;
  }

  if (Array.isArray(payload)) {
    return payload.reduce<number>(
      (total, item) => total + calculateMultipartBodySize(item, visited),
      0,
    );
  }

  if (typeof payload === 'object') {
    const value = payload as Record<string, unknown>;

    if (visited.has(value)) {
      return 0;
    }
    visited.add(value);

    if ('_buf' in value && Buffer.isBuffer(value._buf)) {
      return value._buf.length;
    }

    if ('data' in value && Buffer.isBuffer(value.data)) {
      return value.data.length;
    }

    if ('value' in value && typeof value.value === 'string') {
      return Buffer.byteLength(value.value);
    }

    return Object.entries(value).reduce<number>((total, [key, child]) => {
      if (key === 'fields' || key === 'file') {
        return total;
      }

      return total + calculateMultipartBodySize(child, visited);
    }, 0);
  }

  if (typeof payload === 'string') {
    return Buffer.byteLength(payload);
  }

  return 0;
};

export const configureApp = async (
  app: NestFastifyApplication,
  options: ConfigureAppOptions = {},
): Promise<AppConfig> => {
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');
  const isProduction = appConfig.env === 'production';

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: isProduction
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
  });

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addHook('onRoute', (routeOptions) => {
    const methods = Array.isArray(routeOptions.method)
      ? routeOptions.method
      : [routeOptions.method];

    if (methods.includes('POST') && matchesOtpSendRoute(routeOptions.url)) {
      const existingConfig = routeOptions.config ?? {};
      const normalizedConfig =
        typeof existingConfig === 'object' && existingConfig !== null
          ? existingConfig
          : {};
      const previousRateLimit =
        typeof normalizedConfig === 'object' &&
        normalizedConfig !== null &&
        'rateLimit' in normalizedConfig
          ? (normalizedConfig as { rateLimit?: Record<string, unknown> }).rateLimit
          : {};

      routeOptions.config = {
        ...normalizedConfig,
        rateLimit: {
          ...(previousRateLimit ?? {}),
          max: appConfig.rateLimit.otp.max,
          timeWindow: appConfig.rateLimit.otp.timeWindowMs,
        },
      };
    }
  });

  await app.register(rateLimit, {
    global: true,
    max: appConfig.rateLimit.global.max,
    timeWindow: appConfig.rateLimit.global.timeWindowMs,
    keyGenerator: extractClientIp,
  });

  await app.register(multipart, {
    attachFieldsToBody: true,
    throwFileSizeLimit: true,
    limits: {
      fileSize: appConfig.limits.multipart.file,
    },
  });

  fastifyInstance.addHook('preValidation', (request, _reply, done) => {
    const totalLimit = appConfig.limits.multipart.total;
    if (totalLimit <= 0 || !isMultipartRequest(request)) {
      done();
      return;
    }

    const totalSize = calculateMultipartBodySize(request.body);
    if (totalSize > totalLimit) {
      done(
        new PayloadTooLargeException({
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Multipart payload too large',
        }),
      );
      return;
    }

    done();
  });

  app.useGlobalFilters(
    new HttpErrorFilter({
      exposeErrorDetails: !isProduction,
      logger: options.logger,
      captureException: options.captureException,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: appConfig.swaggerPath, method: RequestMethod.GET },
      { path: `${appConfig.swaggerPath}-json`, method: RequestMethod.GET },
    ],
  });

  return appConfig;
};
