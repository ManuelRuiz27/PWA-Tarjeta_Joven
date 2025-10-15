import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByCurp(curp: string) {
    return this.prisma.user.findUnique({ where: { curp } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  mapToResponse(user: User) {
    const { id, nombre, apellidos, curp, municipio, telefono } = user;
    return { id, nombre, apellidos, curp, municipio, telefono };
  }

  async getOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }
    return user;
  }
}
