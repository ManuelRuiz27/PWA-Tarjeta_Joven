import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePushSubscriptionDto } from './dto/create-subscription.dto';
import { PushService } from './push.service';

@ApiTags('Push')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('push/subscriptions')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar suscripción push' })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        endpoint: { type: 'string' },
        p256dh: { type: 'string' },
        auth: { type: 'string' },
        userId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePushSubscriptionDto,
  ) {
    return this.pushService.create(user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar suscripción push' })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.pushService.remove(user, id);
    return;
  }
}
