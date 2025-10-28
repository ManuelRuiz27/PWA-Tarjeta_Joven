import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { FastifyRequest } from 'fastify';
import { PushModule } from './push.module';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

type HttpServer = Parameters<typeof request>[0];
type AuthenticatedFastifyRequest = FastifyRequest & { user?: AuthenticatedUser };

interface UserEntity {
  id: string;
  curp: string;
}

interface PushSubscriptionEntity {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

interface PushSubscriptionResponse {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

class PrismaServiceMock {
  private users: UserEntity[] = [];
  private pushSubscriptions: PushSubscriptionEntity[] = [];
  private counter = 1;

  user = {
    findUnique: ({ where }: { where: { id?: string } }) => {
      if (!where.id) {
        return Promise.resolve(null);
      }
      const user = this.users.find((candidate) => candidate.id === where.id);
      return Promise.resolve(user ? { ...user } : null);
    },
  };

  pushSubscription = {
    findUnique: ({
      where,
    }: {
      where:
        | { id: string; userId_endpoint?: undefined }
        | { id?: undefined; userId_endpoint: { userId: string; endpoint: string } };
    }) => {
      if ('id' in where && where.id) {
        const subscription = this.pushSubscriptions.find((item) => item.id === where.id);
        return Promise.resolve(subscription ? { ...subscription } : null);
      }
      if ('userId_endpoint' in where && where.userId_endpoint) {
        const subscription = this.pushSubscriptions.find(
          (item) =>
            item.userId === where.userId_endpoint.userId &&
            item.endpoint === where.userId_endpoint.endpoint,
        );
        return Promise.resolve(subscription ? { ...subscription } : null);
      }
      return Promise.resolve(null);
    },
    create: ({
      data,
    }: {
      data: {
        userId: string;
        endpoint: string;
        p256dh: string;
        auth: string;
      };
    }) => {
      const entity: PushSubscriptionEntity = {
        id: `sub_${this.counter++}`,
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        createdAt: new Date(),
      };
      this.pushSubscriptions.push(entity);
      return Promise.resolve({ ...entity });
    },
    delete: ({ where }: { where: { id: string } }) => {
      const index = this.pushSubscriptions.findIndex((item) => item.id === where.id);
      if (index === -1) {
        return Promise.reject(new Error('Push subscription not found'));
      }
      const [removed] = this.pushSubscriptions.splice(index, 1);
      return Promise.resolve({ ...removed });
    },
  };

  setUsers(users: UserEntity[]) {
    this.users = users.map((user) => ({ ...user }));
  }

  reset() {
    this.pushSubscriptions = [];
    this.counter = 1;
  }
}

class JwtAuthGuardMock implements CanActivate {
  constructor(private readonly tokens: Record<string, AuthenticatedUser>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedFastifyRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Token no encontrado',
      });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Formato de token no vÃƒÂ¡lido',
      });
    }

    const user = this.tokens[token];
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token invÃƒÂ¡lido o expirado',
      });
    }

    request.user = user;
    return true;
  }
}

describe('Push subscriptions (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaServiceMock;
  const tokens: Record<string, AuthenticatedUser> = {
    'token-user-1': { sub: 'usr_1', curp: 'CURP010101HDFABC01' },
    'token-user-2': { sub: 'usr_2', curp: 'CURP020202HDFABC02' },
  };
  const getServer = (): HttpServer => app.getHttpServer() as HttpServer;

  beforeAll(async () => {
    prisma = new PrismaServiceMock();
    prisma.setUsers([
      { id: 'usr_1', curp: 'CURP010101HDFABC01' },
      { id: 'usr_2', curp: 'CURP020202HDFABC02' },
    ]);

    const moduleRef = await Test.createTestingModule({
      imports: [PushModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue(new JwtAuthGuardMock(tokens))
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
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

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    prisma.reset();
  });

  it('creates a push subscription for the authenticated user', async () => {
    const response = await request(getServer())
      .post('/push/subscriptions')
      .set('Authorization', 'Bearer token-user-1')
      .send({
        endpoint: 'https://example.com/push/123',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(201);

    const payload = response.body as PushSubscriptionResponse;
    expect(payload).toMatchObject({
      userId: 'usr_1',
      endpoint: 'https://example.com/push/123',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
    });
    expect(payload.id).toBeDefined();
    expect(payload.createdAt).toBeDefined();
  });

  it('returns conflict when the same subscription already exists for the user', async () => {
    await request(getServer())
      .post('/push/subscriptions')
      .set('Authorization', 'Bearer token-user-1')
      .send({
        endpoint: 'https://example.com/push/duplicate',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(201);

    const conflictResponse = await request(getServer())
      .post('/push/subscriptions')
      .set('Authorization', 'Bearer token-user-1')
      .send({
        endpoint: 'https://example.com/push/duplicate',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(409);
    const conflictPayload = conflictResponse.body as {
      statusCode: number;
      message: string;
      code: string;
    };

    expect(conflictPayload).toMatchObject({
      statusCode: 409,
      message: 'Ya existe una suscripcion con ese endpoint para el usuario',
      code: 'PUSH_SUBSCRIPTION_EXISTS',
    });
  });

  it('deletes a push subscription owned by the authenticated user', async () => {
    const createResponse = await request(getServer())
      .post('/push/subscriptions')
      .set('Authorization', 'Bearer token-user-1')
      .send({
        endpoint: 'https://example.com/push/delete',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(201);

    const created = createResponse.body as PushSubscriptionResponse;
    await request(getServer())
      .delete(`/push/subscriptions/${created.id}`)
      .set('Authorization', 'Bearer token-user-1')
      .expect(204);
  });

  it('rejects requests without a JWT access token', async () => {
    const response = await request(getServer())
      .post('/push/subscriptions')
      .send({
        endpoint: 'https://example.com/push/unauthorized',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(401);

    const payload = response.body as {
      statusCode: number;
      code: string;
      message: string;
    };
    expect(payload).toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Token no encontrado',
    });
  });
});
