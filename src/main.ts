import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './common/bootstrap/configure-app';
import { buildAppConfig } from './config/app.config';
import { buildSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const initialConfig = buildAppConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: initialConfig.limits.json,
    }),
    {
      bufferLogs: true,
    },
  );

  const appConfig = await configureApp(app);

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
