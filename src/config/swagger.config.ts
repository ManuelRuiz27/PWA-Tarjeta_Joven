import { DocumentBuilder } from '@nestjs/swagger';

export const buildSwaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('Tarjeta Joven API')
    .setDescription('API para la Tarjeta Joven')
    .setVersion(process.env.npm_package_version ?? '0.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Token de acceso JWT',
      in: 'header',
    })
    .build();
