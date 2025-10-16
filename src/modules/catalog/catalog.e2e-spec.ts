import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Prisma } from '@prisma/client';
import * as request from 'supertest';
import { CatalogModule } from './catalog.module';
import { PrismaService } from '../../common/services/prisma.service';

type MerchantEntity = {
  id: string;
  nombre: string;
  categoria: string;
  municipio: string;
  descuento: string;
  direccion: string;
  horario: string;
  descripcion: string | null;
  lat: number | null;
  lng: number | null;
  activo: boolean;
};

class PrismaServiceMock {
  private merchants: MerchantEntity[] = [];

  merchant = {
    count: async ({ where }: { where?: Prisma.MerchantWhereInput }) => {
      return this.filterMerchants(where).length;
    },
    findMany: async ({
      where,
      orderBy,
      skip = 0,
      take,
    }: {
      where?: Prisma.MerchantWhereInput;
      orderBy?: Prisma.MerchantOrderByWithRelationInput;
      skip?: number;
      take?: number;
    }) => {
      const filtered = this.filterMerchants(where);
      const sorted = orderBy?.nombre === 'asc'
        ? [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre))
        : filtered;
      const start = skip ?? 0;
      const end = typeof take === 'number' ? start + take : undefined;
      return sorted.slice(start, end).map(({ activo, ...item }) => ({ ...item }));
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return this.merchants.find((merchant) => merchant.id === where.id) ?? null;
    },
  };

  async $transaction<T>(operations: Promise<T>[]): Promise<T[]> {
    return Promise.all(operations);
  }

  setMerchants(list: MerchantEntity[]) {
    this.merchants = list;
  }

  private filterMerchants(where?: Prisma.MerchantWhereInput) {
    return this.merchants.filter((merchant) => this.matchesWhere(merchant, where));
  }

  private matchesWhere(
    merchant: MerchantEntity,
    where?: Prisma.MerchantWhereInput,
  ): boolean {
    if (!where) {
      return true;
    }

    const { AND, OR, NOT, ...fields } = where;

    if (!this.matchesFields(merchant, fields)) {
      return false;
    }

    if (AND && !AND.every((clause) => this.matchesWhere(merchant, clause))) {
      return false;
    }

    if (OR && !OR.some((clause) => this.matchesWhere(merchant, clause))) {
      return false;
    }

    if (NOT && NOT.some((clause) => this.matchesWhere(merchant, clause))) {
      return false;
    }

    return true;
  }

  private matchesFields(
    merchant: MerchantEntity,
    fields: Prisma.MerchantWhereInput,
  ): boolean {
    for (const [key, condition] of Object.entries(fields)) {
      if (!this.matchesField(merchant, key as keyof MerchantEntity, condition)) {
        return false;
      }
    }
    return true;
  }

  private matchesField(
    merchant: MerchantEntity,
    key: keyof MerchantEntity,
    condition: unknown,
  ): boolean {
    if (condition === undefined) {
      return true;
    }
    const value = merchant[key] as unknown;

    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('equals' in (condition as Record<string, unknown>)) {
        return value === (condition as Record<string, unknown>).equals;
      }
      if ('contains' in (condition as Record<string, unknown>)) {
        const search = String((condition as Record<string, unknown>).contains);
        const candidate = (value ?? '') as string;
        const mode = (condition as Record<string, unknown>).mode;
        if (mode === Prisma.QueryMode.insensitive) {
          return candidate.toLowerCase().includes(search.toLowerCase());
        }
        return candidate.includes(search);
      }
    }

    return value === condition;
  }
}

const createMerchant = (
  overrides: Partial<MerchantEntity> &
    Pick<MerchantEntity, 'id' | 'nombre' | 'categoria' | 'municipio'>,
): MerchantEntity => ({
  id: overrides.id,
  nombre: overrides.nombre,
  categoria: overrides.categoria,
  municipio: overrides.municipio,
  descuento: overrides.descuento ?? '10% de descuento',
  direccion: overrides.direccion ?? 'Calle Falsa 123',
  horario: overrides.horario ?? 'Lunes a Viernes 09:00 - 18:00',
  descripcion: overrides.descripcion ?? null,
  lat: overrides.lat ?? null,
  lng: overrides.lng ?? null,
  activo: overrides.activo ?? true,
});

const baseMerchants = (): MerchantEntity[] => [
  createMerchant({
    id: 'mrc_1',
    nombre: 'Arte Local',
    categoria: 'artesania',
    municipio: 'Guadalajara',
    descripcion: 'Artesanías y regalos únicos',
  }),
  createMerchant({
    id: 'mrc_2',
    nombre: 'Bon Appetit',
    categoria: 'Restaurantes',
    municipio: 'Guadalajara',
    descripcion: 'Comida francesa y postres',
  }),
  createMerchant({
    id: 'mrc_3',
    nombre: 'Zapopan Bites',
    categoria: 'Restaurantes',
    municipio: 'Zapopan',
    descripcion: 'Hamburguesas gourmet y snacks',
  }),
  createMerchant({
    id: 'mrc_4',
    nombre: 'Cine Club',
    categoria: 'Entretenimiento',
    municipio: 'Zapopan',
    descripcion: 'Películas y palomitas',
  }),
  createMerchant({
    id: 'mrc_5',
    nombre: 'Descuento Express',
    categoria: 'Restaurantes',
    municipio: 'Zapopan',
    descripcion: 'Promociones exclusivas',
    activo: false,
  }),
];

describe('CatalogController (e2e)', () => {
  let app: NestFastifyApplication;
  let prismaMock: PrismaServiceMock;

  beforeEach(async () => {
    prismaMock = new PrismaServiceMock();

    const moduleRef = await Test.createTestingModule({
      imports: [CatalogModule],
      providers: [PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prismaMock.setMerchants(baseMerchants());
  });

  afterEach(async () => {
    await app.close();
  });

  it('should list merchants without filters', async () => {
    const response = await request(app.getHttpServer()).get('/catalog');

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(20);
    expect(response.body.total).toBe(4);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.items).toHaveLength(4);
    expect(response.body.items.map((item: any) => item.nombre)).toEqual([
      'Arte Local',
      'Bon Appetit',
      'Cine Club',
      'Zapopan Bites',
    ]);
    expect(response.body.items[0]).toMatchObject({
      id: 'mrc_1',
      categoria: 'artesania',
      municipio: 'Guadalajara',
      descuento: '10% de descuento',
      direccion: 'Calle Falsa 123',
      horario: 'Lunes a Viernes 09:00 - 18:00',
      descripcion: 'Artesanías y regalos únicos',
      lat: null,
      lng: null,
    });
  });

  it('should filter by categoria', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({ categoria: 'restaurantes' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.items.map((item: any) => item.nombre)).toEqual([
      'Bon Appetit',
      'Zapopan Bites',
    ]);
  });

  it('should filter by municipio', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({ municipio: 'zapopan' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.items.map((item: any) => item.nombre)).toEqual([
      'Cine Club',
      'Zapopan Bites',
    ]);
  });

  it('should filter by search query', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({ q: 'hamburguesa' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].nombre).toBe('Zapopan Bites');
  });

  it('should combine filters', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({
        categoria: 'restaurantes',
        municipio: 'zapopan',
        q: 'HAMBURGUESA',
      });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].id).toBe('mrc_3');
  });

  it('should cap page size to maximum allowed', async () => {
    prismaMock.setMerchants(
      Array.from({ length: 60 }, (_, index) =>
        createMerchant({
          id: `mrc_${index + 1}`,
          nombre: `Comercio ${String(index + 1).padStart(2, '0')}`,
          categoria: 'general',
          municipio: 'Guadalajara',
        }),
      ),
    );

    const response = await request(app.getHttpServer())
      .get('/catalog')
      .query({ pageSize: 100 });

    expect(response.status).toBe(200);
    expect(response.body.pageSize).toBe(50);
    expect(response.body.items).toHaveLength(50);
    expect(response.body.total).toBe(60);
    expect(response.body.totalPages).toBe(2);
  });
});
