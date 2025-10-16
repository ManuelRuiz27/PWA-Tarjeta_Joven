import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaService } from '../../common/services/prisma.service';
import { OtpSenderService } from './providers/otp-sender.service';
import { User } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';

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

const uploadsRoot = path.resolve(process.cwd(), 'uploads', 'users');

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
    process.env.STORAGE_DRIVER = 'local';

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
    await fs.rm(uploadsRoot, { recursive: true, force: true });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    prisma.reset();
    otpSender.lastOtp = null;
    await fs.rm(uploadsRoot, { recursive: true, force: true });
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

  describe('registro de usuarios', () => {
    const buildRequest = (overrides: Record<string, string> = {}) => {
      const payload: Record<string, string> = {
        nombre: 'Juan',
        apellidos: 'Pérez',
        fechaNacimiento: '01/02/2000',
        curp: overrides.curp ?? 'AAAA000101HDFLNS12',
        colonia: 'Centro',
        acepta_tc: overrides.acepta_tc ?? 'true',
      };

      if (overrides.telefono) {
        payload.telefono = overrides.telefono;
      }
      if (overrides.municipio) {
        payload.municipio = overrides.municipio;
      }

      let req = request(server()).post('/auth/register');
      for (const [key, value] of Object.entries(payload)) {
        req = req.field(key, value);
      }
      return req;
    };

    const attachDefaultFiles = (req: request.SuperTest<request.Test>) =>
      req
        .attach('ine', Buffer.from('fake-ine'), {
          filename: 'ine.png',
          contentType: 'image/png',
        })
        .attach('curp', Buffer.from('fake-curp'), {
          filename: 'curp.pdf',
          contentType: 'application/pdf',
        })
        .attach('comprobante', Buffer.from('fake-comprobante'), {
          filename: 'comprobante.jpg',
          contentType: 'image/jpeg',
        });

    it('registra al usuario y persiste los archivos', async () => {
      const response = await attachDefaultFiles(buildRequest()).expect(201);

      expect(response.body.userId).toBeDefined();
      const userId = response.body.userId as string;

      const storedUser = prisma.users.find(
        (user) => user.curp === 'AAAA000101HDFLNS12',
      );
      expect(storedUser).toMatchObject({
        nombre: 'Juan',
        apellidos: 'Pérez',
        colonia: 'Centro',
        isActive: true,
      });

      const userDir = path.join(uploadsRoot, userId);
      const files = await fs.readdir(userDir);
      expect(files.some((name) => name.startsWith('ine-'))).toBe(true);
      expect(files.some((name) => name.startsWith('curp-'))).toBe(true);
      expect(files.some((name) => name.startsWith('comprobante-'))).toBe(true);
    });

    it('rechaza archivos mayores a 2MB', async () => {
      const largeBuffer = Buffer.alloc(2 * 1024 * 1024 + 1, 1);

      await buildRequest()
        .attach('ine', largeBuffer, {
          filename: 'ine.png',
          contentType: 'image/png',
        })
        .attach('curp', Buffer.from('fake-curp'), {
          filename: 'curp.pdf',
          contentType: 'application/pdf',
        })
        .attach('comprobante', Buffer.from('fake-comprobante'), {
          filename: 'comprobante.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body.code).toBe('FILE_TOO_LARGE');
        });

      expect(prisma.users).toHaveLength(0);
    });

    it('rechaza formatos de archivo no permitidos', async () => {
      await buildRequest({ curp: 'AEEX000101HDFLNS13' })
        .attach('ine', Buffer.from('contenido'), {
          filename: 'ine.txt',
          contentType: 'text/plain',
        })
        .attach('curp', Buffer.from('fake-curp'), {
          filename: 'curp.pdf',
          contentType: 'application/pdf',
        })
        .attach('comprobante', Buffer.from('fake-comprobante'), {
          filename: 'comprobante.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400)
        .expect(({ body }) => {
          expect(body.code).toBe('FILE_TYPE_NOT_ALLOWED');
        });
    });

    it('impide registrar una CURP duplicada', async () => {
      await attachDefaultFiles(buildRequest()).expect(201);

      await attachDefaultFiles(buildRequest())
        .expect(409)
        .expect(({ body }) => {
          expect(body.code).toBe('USER_ALREADY_REGISTERED');
        });
    });
  });
});
