import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogListDto, MerchantDto } from './dto/catalog-response.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comercios' })
  @ApiOkResponse({ type: CatalogListDto })
  list(@Query() query: CatalogQueryDto) {
    return this.catalogService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de comercio' })
  @ApiOkResponse({ type: MerchantDto })
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }
}
