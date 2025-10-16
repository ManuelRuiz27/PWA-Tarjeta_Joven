import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../config/app.config';
import { HttpErrorFilter } from '../filters/http-exception.filter';

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

const enforceMultipartTotalLimit = (
  request: FastifyRequest,
  reply: FastifyReply,
  totalLimit: number,
) => {
  if (totalLimit <= 0) {
    return false;
  }

  const contentType = normalizeHeaderValue(request.headers['content-type']);
  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    return false;
  }

  const contentLengthHeader = normalizeHeaderValue(request.headers['content-length']);
  if (!contentLengthHeader) {
    return false;
  }

  const contentLength = Number(contentLengthHeader);
  if (!Number.isFinite(contentLength) || contentLength <= totalLimit) {
    return false;
  }

  reply
    .code(HttpStatus.PAYLOAD_TOO_LARGE)
    .send({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Multipart payload too large',
    });

  return true;
};

export const configureApp = async (
  app: NestFastifyApplication,
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

  const corsOrigin = appConfig.cors.origin;
  await app.register(fastifyCors, {
    origin: corsOrigin,
    credentials: corsOrigin === '*' ? false : appConfig.cors.credentials,
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

  fastifyInstance.addHook('onRequest', (request, reply, done) => {
    const blocked = enforceMultipartTotalLimit(request, reply, appConfig.limits.multipart.total);
    if (!blocked) {
      done();
    }
  });

  app.useGlobalFilters(
    new HttpErrorFilter({ exposeErrorDetails: !isProduction }),
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
