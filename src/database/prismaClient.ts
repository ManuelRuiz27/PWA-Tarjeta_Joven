import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const initializeDatabase = async (): Promise<void> => {
  await prisma.$connect();
};
