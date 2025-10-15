import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreatePushSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class PushService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreatePushSubscriptionDto) {
    const owner = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!owner) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      });
    }

    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: dto.endpoint },
    });
    if (existing) {
      throw new ConflictException({
        code: 'PUSH_SUBSCRIPTION_EXISTS',
        message: 'Ya existe una suscripción con ese endpoint',
      });
    }

    const subscription = await this.prisma.pushSubscription.create({
      data: {
        userId: user.sub,
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
      },
    });

    return subscription;
  }

  async remove(user: AuthenticatedUser, id: string) {
    const subscription = await this.prisma.pushSubscription.findUnique({
      where: { id },
    });
    if (!subscription || subscription.userId !== user.sub) {
      throw new NotFoundException({
        code: 'PUSH_SUBSCRIPTION_NOT_FOUND',
        message: 'Suscripción no encontrada',
      });
    }

    await this.prisma.pushSubscription.delete({ where: { id } });
  }
}
