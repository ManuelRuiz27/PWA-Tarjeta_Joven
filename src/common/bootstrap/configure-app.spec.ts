import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import appConfig, { buildAppConfig } from '../../config/app.config';
import { configureApp } from './configure-app';

type UploadBody = Record<string, unknown> | undefined;

@Controller('security-test')
class SecurityTestController {
  @Post('json')
  @HttpCode(HttpStatus.OK)
  handleJson(@Body() body: Record<string, unknown>) {
    return { received: body }; // response is irrelevant; limits trigger before handler
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  handleUpload(@Body() body: UploadBody) {
    return { fields: Object.keys(body ?? {}).length };
  }
}

@Controller('auth')
class AuthTestController {
  @Post('otp/send')
  @HttpCode(HttpStatus.NO_CONTENT)
  sendOtp() {
    return;
  }
}

type HttpServer = Parameters<typeof request>[0];

describe('configureApp security hardening', () => {
  let app: NestFastifyApplication | null = null;

  const createApp = async (): Promise<NestFastifyApplication> => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
      ],
      controllers: [SecurityTestController, AuthTestController],
    }).compile();

    const initialConfig = buildAppConfig();

    const application = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        bodyLimit: initialConfig.limits.json,
      }),
    );

    await configureApp(application);
    await application.init();
    await application.getHttpAdapter().getInstance().ready();

    return application;
  };

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it('rejects JSON payloads larger than the configured limit', async () => {
    app = await createApp();
    const server = app.getHttpServer() as HttpServer;

    const oversizedPayload = 'x'.repeat(1 * 1024 * 1024 + 1);

    const response = await request(server)
      .post('/api/v1/security-test/json')
      .send({ data: oversizedPayload });

    expect(response.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
  });

  it('rejects multipart payloads exceeding per-file size', async () => {
    app = await createApp();
    const server = app.getHttpServer() as HttpServer;

    const largeFile = Buffer.alloc(2 * 1024 * 1024 + 1);

    const response = await request(server)
      .post('/api/v1/security-test/upload')
      .attach('document', largeFile, {
        filename: 'large.bin',
        contentType: 'application/octet-stream',
      });

    expect(response.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
  });

  it('rejects multipart payloads exceeding the total size limit', async () => {
    app = await createApp();
    const server = app.getHttpServer() as HttpServer;

    const partSize = Math.floor(1.8 * 1024 * 1024);
    const chunk = Buffer.alloc(partSize, 1);

    const multipartRequest = request(server).post(
      '/api/v1/security-test/upload',
    );
    for (let index = 0; index < 6; index += 1) {
      multipartRequest.attach(`file${index}`, chunk, {
        filename: `file${index}.bin`,
        contentType: 'application/octet-stream',
      });
    }

    await multipartRequest.expect(HttpStatus.PAYLOAD_TOO_LARGE);
  });

  it('applies a tighter rate limit to the OTP endpoint', async () => {
    app = await createApp();
    const server = app.getHttpServer() as HttpServer;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await request(server)
        .post('/api/v1/auth/otp/send')
        .send({})
        .expect(HttpStatus.NO_CONTENT);
    }

    await request(server)
      .post('/api/v1/auth/otp/send')
      .send({})
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  });
});
