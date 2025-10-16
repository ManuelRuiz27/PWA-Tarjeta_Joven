import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaService } from '../../common/services/prisma.service';
import { OtpSenderService } from './providers/otp-sender.service';
import { User } from '@prisma/client';

type OtpRequestEntity = {
  id: string;
  curp: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  resends: number;
  createdAt: Date;
};

type UserEntity = User;

class PrismaServiceMock {
  otpRequests: OtpRequestEntity[] = [];
  users: UserEntity[] = [];
  private userCounter = 1;

  otpRequest = {
    findFirst: async ({ where }: { where: { curp: string } }) => {
      const list = this.otpRequests
        .filter((item) => item.curp === where.curp)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return list[0] ?? null;
    },
    create: async ({
      data,
    }: {
      data: {
        curp: string;
        codeHash: string;
        expiresAt: Date;
        resends: number;
      };
    }) => {
      const entity: OtpRequestEntity = {
        id: `otp_${Math.random().toString(36).slice(2)}`,
        curp: data.curp,
        codeHash: data.codeHash,
        expiresAt: data.expiresAt,
        resends: data.resends,
        attempts: 0,
        createdAt: new Date(),
      };
      this.otpRequests.push(entity);
      return entity;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<OtpRequestEntity>;
    }) => {
      const index = this.otpRequests.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('OTP not found');
      }
      const existing = this.otpRequests[index];
      const updated: OtpRequestEntity = {
        ...existing,
        ...data,
        createdAt: data.createdAt ?? existing.createdAt,
        attempts: data.attempts ?? existing.attempts,
        resends: data.resends ?? existing.resends,
        expiresAt: data.expiresAt ?? existing.expiresAt,
        codeHash: data.codeHash ?? existing.codeHash,
      };
      this.otpRequests[index] = updated;
      return updated;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = this.otpRequests.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('OTP not found');
      }
      const [removed] = this.otpRequests.splice(index, 1);
      return removed;
    },
  };

  user = {
    findUnique: async ({ where }: { where: { id?: string; curp?: string } }) => {
      if (where.id) {
        return this.users.find((user) => user.id === where.id) ?? null;
      }
      if (where.curp) {
        return this.users.find((user) => user.curp === where.curp) ?? null;
      }
      return null;
    },
    create: async ({ data }: { data: Partial<UserEntity> & { curp: string } }) => {
      const now = new Date();
      const entity: UserEntity = {
        id: `usr_${this.userCounter++}`,
        nombre: data.nombre ?? 'Pendiente',
        apellidos: data.apellidos ?? 'Pendiente',
        curp: data.curp,
        fechaNacimiento: data.fechaNacimiento ?? now,
        colonia: data.colonia ?? 'Pendiente',
        telefono: data.telefono ?? null,
        municipio: data.municipio ?? null,
        isActive: data.isActive ?? false,
        createdAt: now,
        updatedAt: now,
      } as UserEntity;
      this.users.push(entity);
      return entity;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<UserEntity>;
    }) => {
      const index = this.users.findIndex((user) => user.id === where.id);
      if (index === -1) {
        throw new Error('User not found');
      }
      const existing = this.users[index];
      const updated: UserEntity = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      } as UserEntity;
      this.users[index] = updated;
      return updated;
    },
  };

  reset() {
    this.otpRequests = [];
    this.users = [];
    this.userCounter = 1;
  }
}

describe('Auth flow (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaServiceMock;
  const otpSender = {
    lastOtp: null as string | null,
    async sendOtp(curp: string, otp: string) {
      this.lastOtp = otp;
      return Promise.resolve();
    },
  };

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test_access_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_ACCESS_TTL = '60s';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.OTP_TTL_SECONDS = '120';
    process.env.OTP_MAX_RESENDS = '2';
    process.env.OTP_COOLDOWN_SECONDS = '30';
    process.env.OTP_THROTTLE_LIMIT = '100';
    process.env.OTP_THROTTLE_WINDOW_SECONDS = '60';

    prisma = new PrismaServiceMock();

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(OtpSenderService)
      .useValue(otpSender)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prisma.reset();
    otpSender.lastOtp = null;
  });

  const server = () => app.getHttpServer();
  const curp = 'PEPJ800101HDFLLL01';

  it('envía OTP exitosamente', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    expect(otpSender.lastOtp).toHaveLength(6);
  });

  it('verifica OTP válido y devuelve tokens', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    const otp = otpSender.lastOtp as string;

    const response = await request(server())
      .post('/auth/otp/verify')
      .send({ curp, otp })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user).toMatchObject({ curp });
  });

  it('rechaza OTP expirado', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    const requestRecord = prisma.otpRequests[0];
    requestRecord.expiresAt = new Date(Date.now() - 1_000);

    await request(server())
      .post('/auth/otp/verify')
      .send({ curp, otp: otpSender.lastOtp })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('OTP_EXPIRED');
      });
  });

  it('limita reenvíos por CURP', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    prisma.otpRequests[0].createdAt = new Date(Date.now() - 31_000);

    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    prisma.otpRequests[0].createdAt = new Date(Date.now() - 31_000);

    await request(server())
      .post('/auth/otp/send')
      .send({ curp })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('OTP_MAX_RESENDS');
      });
  });

  it('aplica cooldown antes de reenviar', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);

    await request(server())
      .post('/auth/otp/send')
      .send({ curp })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('OTP_COOLDOWN');
      });
  });
});
