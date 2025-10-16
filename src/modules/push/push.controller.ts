import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePushSubscriptionDto } from './dto/create-subscription.dto';
import { PushSubscriptionResponseDto } from './dto/push-subscription-response.dto';
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
    type: PushSubscriptionResponseDto,
    description: 'Suscripción creada correctamente',
  })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePushSubscriptionDto,
  ) {
    return this.pushService.create(user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar suscripción push' })
  @ApiNoContentResponse({ description: 'Suscripción eliminada correctamente' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.pushService.remove(user, id);
    return;
  }
}
