import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request, { Response as SupertestResponse, Test as SuperTestRequest } from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaService } from '../../common/services/prisma.service';
import { OtpSenderService } from './providers/otp-sender.service';
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

type HttpServer = Parameters<typeof request>[0];

interface UserEntity {
  id: string;
  nombre: string;
  apellidos: string;
  curp: string;
  email: string | null;
  fechaNacimiento: Date;
  colonia: string;
  telefono: string | null;
  municipio: string | null;
  isActive: boolean;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const uploadsRoot = path.resolve(process.cwd(), 'uploads', 'users');
const extractBody = <T>(response: SupertestResponse): T => response.body as T;

class PrismaServiceMock {
  public otpRequests: OtpRequestEntity[] = [];
  public users: UserEntity[] = [];
  private userCounter = 1;

  otpRequest = {
    findFirst: ({ where }: { where: { curp: string } }) => {
      const list = this.otpRequests
        .filter((item) => item.curp === where.curp)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return Promise.resolve(list[0] ?? null);
    },
    create: ({
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
      return Promise.resolve(entity);
    },
    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<OtpRequestEntity>;
    }) => {
      const index = this.otpRequests.findIndex((item) => item.id === where.id);
      if (index === -1) {
        return Promise.reject(new Error('OTP not found'));
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
      return Promise.resolve(updated);
    },
    delete: ({ where }: { where: { id: string } }) => {
      const index = this.otpRequests.findIndex((item) => item.id === where.id);
      if (index === -1) {
        return Promise.reject(new Error('OTP not found'));
      }
      const [removed] = this.otpRequests.splice(index, 1);
      return Promise.resolve(removed);
    },
  };

  user = {
    findUnique: ({
      where,
    }: {
      where: { id?: string; curp?: string; email?: string | null };
    }) => {
      if (where.id) {
        return Promise.resolve(this.users.find((user) => user.id === where.id) ?? null);
      }
      if (where.curp) {
        return Promise.resolve(this.users.find((user) => user.curp === where.curp) ?? null);
      }
      if (where.email) {
        return Promise.resolve(
          this.users.find((user) => user.email === where.email) ?? null,
        );
      }
      return Promise.resolve(null);
    },
    create: ({ data }: { data: Partial<UserEntity> & { curp: string } }) => {
      const now = new Date();
      const entity: UserEntity = {
        id: `usr_${this.userCounter++}`,
        nombre: data.nombre ?? 'Pendiente',
        apellidos: data.apellidos ?? 'Pendiente',
        curp: data.curp,
        email: data.email ?? null,
        fechaNacimiento: data.fechaNacimiento ?? now,
        colonia: data.colonia ?? 'Pendiente',
        telefono: data.telefono ?? null,
        municipio: data.municipio ?? null,
        isActive: data.isActive ?? false,
        passwordHash: data.passwordHash ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.push(entity);
      return Promise.resolve(entity);
    },
    update: ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<UserEntity>;
    }) => {
      const index = this.users.findIndex((user) => user.id === where.id);
      if (index === -1) {
        return Promise.reject(new Error('User not found'));
      }
      const existing = this.users[index];
      const updated: UserEntity = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      this.users[index] = updated;
      return Promise.resolve(updated);
    },
  };

  reset(): void {
    this.otpRequests = [];
    this.users = [];
    this.userCounter = 1;
  }
}

class OtpSenderServiceMock {
  public lastOtp: string | null = null;

  sendOtp(_curp: string, otp: string): Promise<void> {
    this.lastOtp = otp;
    return Promise.resolve();
  }
}

describe('Auth flow (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaServiceMock;
  const otpSender = new OtpSenderServiceMock();

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_access_secret';
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

  const server = (): HttpServer => app.getHttpServer() as HttpServer;
  const curp = 'PEPJ800101HDFLLL01';

  it('envÃ­a OTP exitosamente', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    expect(otpSender.lastOtp).toHaveLength(6);
  });

  it('verifica OTP vÃ¡lido y devuelve tokens', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    const otp = otpSender.lastOtp as string;

    const response = await request(server())
      .post('/auth/otp/verify')
      .send({ curp, otp })
      .expect(200);

    const tokens = extractBody<{ accessToken: string; refreshToken: string; user: Record<string, unknown> }>(response);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.user).toMatchObject({ curp });
  });

  it('rechaza OTP expirado', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    const requestRecord = prisma.otpRequests[0];
    requestRecord.expiresAt = new Date(Date.now() - 1_000);

    await request(server())
      .post('/auth/otp/verify')
      .send({ curp, otp: otpSender.lastOtp })
      .expect(400)
      .expect((response: SupertestResponse) => {
        const payload = extractBody<{ code: string }>(response);
        expect(payload.code).toBe('OTP_EXPIRED');
      });
  });

  it('limita reenvÃ­os por CURP', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    prisma.otpRequests[0].createdAt = new Date(Date.now() - 31_000);

    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);
    prisma.otpRequests[0].createdAt = new Date(Date.now() - 31_000);

    await request(server())
      .post('/auth/otp/send')
      .send({ curp })
      .expect(403)
      .expect((response: SupertestResponse) => {
        const payload = extractBody<{ code: string }>(response);
        expect(payload.code).toBe('OTP_MAX_RESENDS');
      });
  });

  it('aplica cooldown antes de reenviar', async () => {
    await request(server()).post('/auth/otp/send').send({ curp }).expect(204);

    await request(server())
      .post('/auth/otp/send')
      .send({ curp })
      .expect(403)
      .expect((response: SupertestResponse) => {
        const payload = extractBody<{ code: string }>(response);
        expect(payload.code).toBe('OTP_COOLDOWN');
      });
  });

  describe('registro de usuarios', () => {
    const buildRequest = (
      overrides: Record<string, string> = {},
    ): SuperTestRequest => {
      const payload: Record<string, string> = {
        nombre: 'Juan',
        apellidos: 'PA�Acrez',
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

      const formRequest: SuperTestRequest = request(server()).post('/auth/register');
      for (const [key, value] of Object.entries(payload)) {
        formRequest.field(key, value);
      }
      return formRequest;
    };


    const attachDefaultFiles = (req: SuperTestRequest): SuperTestRequest =>
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

      const creationPayload = extractBody<{ userId: string }>(response);
      expect(creationPayload.userId).toBeDefined();
      const userId = creationPayload.userId;

      const storedUser = prisma.users.find(
        (user) => user.curp === 'AAAA000101HDFLNS12',
      );
      expect(storedUser).toMatchObject({
        nombre: 'Juan',
        apellidos: 'PÃ©rez',
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
        .expect((response: SupertestResponse) => {
          const payload = extractBody<{ code: string }>(response);
          expect(payload.code).toBe('FILE_TOO_LARGE');
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
        .expect((response: SupertestResponse) => {
          const payload = extractBody<{ code: string }>(response);
          expect(payload.code).toBe('FILE_TYPE_NOT_ALLOWED');
        });
    });

    it('impide registrar una CURP duplicada', async () => {
      await attachDefaultFiles(buildRequest()).expect(201);

      await attachDefaultFiles(buildRequest())
        .expect(409)
        .expect((response: SupertestResponse) => {
          const payload = extractBody<{ code: string }>(response);
          expect(payload.code).toBe('USER_ALREADY_REGISTERED');
        });
    });
  });
});
