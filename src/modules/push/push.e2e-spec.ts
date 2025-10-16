import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as request from 'supertest';
import { FastifyRequest } from 'fastify';
import { PushModule } from './push.module';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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

class PrismaServiceMock {
  private users: UserEntity[] = [];
  private pushSubscriptions: PushSubscriptionEntity[] = [];
  private counter = 1;

  user = {
    findUnique: async ({ where }: { where: { id?: string } }) => {
      if (!where.id) {
        return null;
      }
      const user = this.users.find((candidate) => candidate.id === where.id);
      return user ? { ...user } : null;
    },
  };

  pushSubscription = {
    findUnique: async ({
      where,
    }: {
      where:
        | { id: string; userId_endpoint?: undefined }
        | { id?: undefined; userId_endpoint: { userId: string; endpoint: string } };
    }) => {
      if ('id' in where && where.id) {
        const subscription = this.pushSubscriptions.find((item) => item.id === where.id);
        return subscription ? { ...subscription } : null;
      }
      if ('userId_endpoint' in where && where.userId_endpoint) {
        const subscription = this.pushSubscriptions.find(
          (item) =>
            item.userId === where.userId_endpoint.userId &&
            item.endpoint === where.userId_endpoint.endpoint,
        );
        return subscription ? { ...subscription } : null;
      }
      return null;
    },
    create: async ({
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
      return { ...entity };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = this.pushSubscriptions.findIndex((item) => item.id === where.id);
      if (index === -1) {
        throw new Error('Push subscription not found');
      }
      const [removed] = this.pushSubscriptions.splice(index, 1);
      return { ...removed };
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
    const request = context.switchToHttp().getRequest<FastifyRequest>();
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
        message: 'Formato de token no válido',
      });
    }

    const user = this.tokens[token];
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado',
      });
    }

    (request as any).user = user;
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
    const response = await request(app.getHttpServer())
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

    expect(response.body).toMatchObject({
      userId: 'usr_1',
      endpoint: 'https://example.com/push/123',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
    });
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('returns conflict when the same subscription already exists for the user', async () => {
    await request(app.getHttpServer())
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

    const conflictResponse = await request(app.getHttpServer())
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

    expect(conflictResponse.body).toMatchObject({
      statusCode: 409,
      message: 'Ya existe una suscripción con ese endpoint para el usuario',
      code: 'PUSH_SUBSCRIPTION_EXISTS',
    });
  });

  it('deletes a push subscription owned by the authenticated user', async () => {
    const { body } = await request(app.getHttpServer())
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

    await request(app.getHttpServer())
      .delete(`/push/subscriptions/${body.id}`)
      .set('Authorization', 'Bearer token-user-1')
      .expect(204);
  });

  it('rejects requests without a JWT access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/push/subscriptions')
      .send({
        endpoint: 'https://example.com/push/unauthorized',
        keys: {
          p256dh: 'p256dh-key',
          auth: 'auth-key',
        },
      })
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Token no encontrado',
    });
  });
});
