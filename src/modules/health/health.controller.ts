import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiProperty } from '@nestjs/swagger';
import { HealthService } from './health.service';

class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: true })
  db!: boolean;
}

@ApiTags('Util')
@Controller('healthz')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  @ApiOkResponse({ type: HealthResponseDto })
  check() {
    return this.healthService.check();
  }
}
