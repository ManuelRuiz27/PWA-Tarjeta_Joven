import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as request from 'supertest';
import { VersionModule } from './version.module';

describe('VersionController (e2e)', () => {
  let app: NestFastifyApplication;
  const packageJsonPath = join(process.cwd(), 'package.json');
  const { version: packageVersion } = JSON.parse(
    readFileSync(packageJsonPath, 'utf8'),
  ) as { version: string };
  const originalEnv = {
    GIT_COMMIT_SHORT: process.env.GIT_COMMIT_SHORT,
    GIT_COMMIT: process.env.GIT_COMMIT,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    COMMIT_SHA: process.env.COMMIT_SHA,
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [VersionModule],
    }).compile();

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
    process.env.GIT_COMMIT_SHORT = originalEnv.GIT_COMMIT_SHORT;
    process.env.GIT_COMMIT = originalEnv.GIT_COMMIT;
    process.env.VERCEL_GIT_COMMIT_SHA = originalEnv.VERCEL_GIT_COMMIT_SHA;
    process.env.COMMIT_SHA = originalEnv.COMMIT_SHA;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the package version and commit from GIT_COMMIT_SHORT', async () => {
    process.env.GIT_COMMIT_SHORT = 'abc1234';

    const response = await request(app.getHttpServer()).get('/version');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ version: packageVersion, commit: 'abc1234' });
  });

  it('falls back to unknown when no commit env variables are present', async () => {
    process.env.GIT_COMMIT_SHORT = undefined;
    process.env.GIT_COMMIT = undefined;
    process.env.VERCEL_GIT_COMMIT_SHA = undefined;
    process.env.COMMIT_SHA = undefined;

    const response = await request(app.getHttpServer()).get('/version');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ version: packageVersion, commit: 'unknown' });
  });
});
