import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { VersionService } from './version.service';

class VersionResponseDto {
  @ApiProperty({ example: '0.1.0' })
  version!: string;

  @ApiProperty({ example: 'unknown' })
  commit!: string;
}

@ApiTags('Util')
@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener versión del servicio' })
  @ApiOkResponse({ type: VersionResponseDto })
  getVersion() {
    return this.versionService.getVersion();
  }
}
