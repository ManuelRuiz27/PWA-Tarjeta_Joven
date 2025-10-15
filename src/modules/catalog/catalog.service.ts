import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: CatalogQueryDto) {
    const where: Prisma.MerchantWhereInput = {
      activo: true,
    };
    if (query.categoria) {
      where.categoria = {
        contains: query.categoria,
        mode: Prisma.QueryMode.insensitive,
      };
    }
    if (query.municipio) {
      where.municipio = {
        contains: query.municipio,
        mode: Prisma.QueryMode.insensitive,
      };
    }
    if (query.q) {
      where.OR = [
        {
          nombre: {
            contains: query.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          descripcion: {
            contains: query.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.merchant.count({ where }),
      this.prisma.merchant.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      data: items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException({
        code: 'MERCHANT_NOT_FOUND',
        message: 'Comercio no encontrado',
      });
    }
    return merchant;
  }
}
