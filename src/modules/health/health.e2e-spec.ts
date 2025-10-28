import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../../common/services/prisma.service';
import { HealthModule } from './health.module';

type HttpServer = Parameters<typeof request>[0];

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;
  const prismaService: Pick<PrismaService, '$queryRaw'> & {
    $queryRaw: jest.Mock;
  } = {
    $queryRaw: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService as PrismaService)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => {
    prismaService.$queryRaw.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns db true when the database is reachable', async () => {
    prismaService.$queryRaw.mockResolvedValueOnce(undefined);

    const response = await request(app.getHttpServer() as HttpServer).get(
      '/healthz',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', db: true });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns db false when the database is not reachable', async () => {
    prismaService.$queryRaw.mockRejectedValueOnce(new Error('oops'));

    const response = await request(app.getHttpServer() as HttpServer).get(
      '/healthz',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', db: false });
    expect(prismaService.$queryRaw).toHaveBeenCalledTimes(1);
  });

});
