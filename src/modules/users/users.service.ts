import { prisma } from '../../database/prismaClient';

export class UsersService {
  findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
