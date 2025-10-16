import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { configureApp } from './common/bootstrap/configure-app';
import { JsonLoggerService } from './common/logging/json-logger.service';
import { buildAppConfig } from './config/app.config';
import { buildSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const initialConfig = buildAppConfig();
  const logger = new JsonLoggerService({ level: initialConfig.logLevel });
  let captureException: ((exception: unknown, context?: Record<string, unknown>) => void) | undefined;

  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: initialConfig.env,
    });

    captureException = (exception: unknown, context?: Record<string, unknown>) => {
      Sentry.captureException(exception, {
        extra: context,
      });
    };

    process.on('unhandledRejection', (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logger.error(
        {
          message: 'Unhandled promise rejection',
          reason: reason instanceof Error ? undefined : reason,
        },
        error.stack,
        'UnhandledRejection',
      );

      captureException?.(reason, { mechanism: 'unhandledRejection' });
    });

    process.on('uncaughtException', (error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.fatal(
        {
          message: 'Uncaught exception',
          error: error instanceof Error ? undefined : error,
        },
        normalizedError.stack,
        'UncaughtException',
      );

      captureException?.(error, { mechanism: 'uncaughtException' });
    });
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: initialConfig.limits.json,
    }),
    {
      bufferLogs: true,
    },
  );

  app.useLogger(logger);
  app.flushLogs();

  const appConfig = await configureApp(app, {
    logger,
    captureException,
  });

  const swaggerConfig = buildSwaggerConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(appConfig.swaggerPath, app, document, {
    jsonDocumentUrl: `${appConfig.swaggerPath}-json`,
  });

  await app.listen({
    port: appConfig.port,
    host: '0.0.0.0',
  });
}

bootstrap();
